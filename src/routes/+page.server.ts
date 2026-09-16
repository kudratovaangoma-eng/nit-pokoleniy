import { HERITAGE_TYPES } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
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
