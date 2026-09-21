import { DEMO_PEOPLE, DEMO_RECORDS, DEMO_TASKS } from '$lib/demo';
import { supabaseConfigured } from '$lib/supabase';
import { HERITAGE_TYPES } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Пока базы нет, показываем примеры: пустой сайт нельзя ни оценить,
	// ни показать человеку. С настоящими ключами сюда уже не заходим.
	if (!supabaseConfigured) {
		const done = DEMO_TASKS.filter((t) => t.status === 'done');
		return {
			demo: true,
			loadError: false,
			typeCounts: Object.fromEntries(
				HERITAGE_TYPES.map((type) => [type, DEMO_RECORDS.filter((r) => r.type === type).length])
			) as Record<string, number>,
			counts: {
				records: DEMO_RECORDS.length,
				people: DEMO_PEOPLE.length,
				done: done.length
			},
			latestRecords: DEMO_RECORDS.slice(-3).reverse(),
			openTasks: DEMO_TASKS.filter((t) => t.status !== 'done').slice(0, 3)
		};
	}

	// Сколько записей в каждом разделе — числа на плитках говорят, где уже
	// есть что послушать, а где пусто и нужна помощь.
	const byType = Promise.all(
		HERITAGE_TYPES.map((type) =>
			locals.supabase.from('records').select('*', { count: 'exact', head: true }).eq('type', type)
		)
	);

	const [records, people, doneTasks, latest, open, typeCounts] = await Promise.all([
		locals.supabase.from('records').select('*', { count: 'exact', head: true }),
		locals.supabase.from('people').select('*', { count: 'exact', head: true }),
		locals.supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'done'),
		locals.supabase
			.from('records')
			.select('id, title, type, carrier_name')
			.order('created_at', { ascending: false })
			.limit(3),
		locals.supabase
			.from('tasks')
			.select('id, title, deadline, status, task_responders(count)')
			.in('status', ['open', 'in_progress'])
			.order('deadline', { ascending: true })
			.limit(3),
		byType
	]);

	return {
		demo: false,
		// Счётчики — обещание, что дело идёт. Ноль из-за сбоя связи и честный
		// ноль в начале пути — разные вещи, и человеку их нельзя путать.
		loadError: Boolean(records.error || people.error || doneTasks.error || latest.error || open.error),
		typeCounts: Object.fromEntries(
			HERITAGE_TYPES.map((type, i) => [type, typeCounts[i].count ?? 0])
		) as Record<string, number>,
		counts: {
			records: records.count ?? 0,
			people: people.count ?? 0,
			done: doneTasks.count ?? 0
		},
		latestRecords: latest.data ?? [],
		openTasks: (open.data ?? []).map((task) => ({
			...task,
			responder_count: task.task_responders?.[0]?.count ?? 0
		}))
	};
};
