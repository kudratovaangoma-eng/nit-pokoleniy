import { DEMO_TASKS } from '$lib/demo';
import { supabaseConfigured } from '$lib/supabase';
import type { PageServerLoad } from './$types';

/**
 * Разворачивает агрегат PostgREST `task_responders(count)` в число.
 * Не экспортируется: SvelteKit разрешает в +page.server.ts только
 * свои экспорты (load, actions, …) и падает на посторонних.
 */
function responderCount(row: { task_responders?: { count: number }[] | null }): number {
	return row.task_responders?.[0]?.count ?? 0;
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!supabaseConfigured) {
		return {
			openTasks: DEMO_TASKS.filter((t) => t.status !== 'done'),
			doneTasks: DEMO_TASKS.filter((t) => t.status === 'done'),
			loadError: false,
			demo: true
		};
	}

	const [open, done] = await Promise.all([
		locals.supabase
			.from('tasks')
			.select('id, title, deadline, status, task_responders(count)')
			.in('status', ['open', 'in_progress'])
			.order('deadline', { ascending: true })
			.limit(60),
		// Выполненные — не архив ради архива: это видимое доказательство,
		// что дела здесь доводятся до конца.
		locals.supabase
			.from('tasks')
			.select('id, title, deadline, status, result_record_id, result_record:records(id, title)')
			.eq('status', 'done')
			.order('deadline', { ascending: false })
			.limit(20)
	]);

	return {
		openTasks: (open.data ?? []).map((task) => ({
			...task,
			responder_count: responderCount(task)
		})),
		doneTasks: done.data ?? [],
		loadError: Boolean(open.error || done.error),
		demo: false
	};
};
