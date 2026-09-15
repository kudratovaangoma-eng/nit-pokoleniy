import type { TaskStatus } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { canWrite: false, created: [], joined: [] };

	// «Мои дела» — это и то, что я предложил, и то, к чему подключился:
	// для участника разницы нет, оба висят на нём.
	const [created, responses] = await Promise.all([
		locals.supabase
			.from('tasks')
			.select('id, title, deadline, status, task_responders(count)')
			.eq('created_by', locals.user.id)
			.order('deadline', { ascending: true }),
		locals.supabase
			.from('task_responders')
			.select('tasks(id, title, deadline, status)')
			.eq('profile_id', locals.user.id)
	]);

	const joined = (responses.data ?? [])
		.map((row) => (Array.isArray(row.tasks) ? row.tasks[0] : row.tasks))
		.filter((task): task is { id: string; title: string; deadline: string; status: TaskStatus } =>
			Boolean(task)
		)
		.sort((a, b) => a.deadline.localeCompare(b.deadline));

	return {
		canWrite: true,
		created: (created.data ?? []).map((task) => ({
			...task,
			responder_count: task.task_responders?.[0]?.count ?? 0
		})),
		joined
	};
};
