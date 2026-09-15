import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: task, error: dbError } = await locals.supabase
		.from('tasks')
		.select(
			'id, title, description, deadline, status, created_by, result_record_id, author:profiles!tasks_created_by_fkey(display_name), result_record:records(id, title)'
		)
		.eq('id', params.id)
		.maybeSingle();

	if (dbError || !task) error(404, 'Дело не найдено');

	// Только имя: контакт человек показывает сам, заведя карточку в «Людях».
	// Отклик на дело — не согласие опубликовать свой телефон.
	const { data: responders } = await locals.supabase
		.from('task_responders')
		.select('profile_id, profiles(display_name)')
		.eq('task_id', params.id);

	// Список записей — чтобы приложить результат к выполненному делу.
	// Показываем свои: приложить обычно хочет тот, кто записывал.
	let myRecords: { id: string; title: string }[] = [];
	if (locals.user) {
		const { data } = await locals.supabase
			.from('records')
			.select('id, title')
			.eq('recorded_by', locals.user.id)
			.order('created_at', { ascending: false })
			.limit(50);
		myRecords = data ?? [];
	}

	return {
		task,
		responders: responders ?? [],
		myRecords,
		canWrite: Boolean(locals.user),
		hasResponded: Boolean(
			locals.user && (responders ?? []).some((r) => r.profile_id === locals.user!.id)
		)
	};
};

export const actions: Actions = {
	respond: async ({ params, locals }) => {
		if (!locals.user) redirect(303, `/auth/login?next=/tasks/${params.id}`);

		const { error: insertError } = await locals.supabase
			.from('task_responders')
			.insert({ task_id: params.id, profile_id: locals.user.id });

		// повторный отклик (например, двойное нажатие) — не ошибка для человека
		if (insertError && insertError.code !== '23505') {
			return fail(500, { actionFailed: true });
		}

		// Первый отклик переводит дело в работу — так видно, что им занялись.
		await locals.supabase
			.from('tasks')
			.update({ status: 'in_progress' })
			.eq('id', params.id)
			.eq('status', 'open');

		return { responded: true };
	},

	withdraw: async ({ params, locals }) => {
		if (!locals.user) redirect(303, `/auth/login?next=/tasks/${params.id}`);

		await locals.supabase
			.from('task_responders')
			.delete()
			.eq('task_id', params.id)
			.eq('profile_id', locals.user.id);

		// Ушёл последний откликнувшийся — дело снова открыто для других
		const { count } = await locals.supabase
			.from('task_responders')
			.select('*', { count: 'exact', head: true })
			.eq('task_id', params.id);

		if (!count) {
			await locals.supabase
				.from('tasks')
				.update({ status: 'open' })
				.eq('id', params.id)
				.eq('status', 'in_progress');
		}

		return { withdrawn: true };
	},

	complete: async ({ params, request, locals }) => {
		if (!locals.user) redirect(303, `/auth/login?next=/tasks/${params.id}`);

		const form = await request.formData();
		const recordId = String(form.get('result_record_id') ?? '').trim();

		const { error: updateError } = await locals.supabase
			.from('tasks')
			.update({
				status: 'done',
				result_record_id: recordId || null
			})
			.eq('id', params.id);

		if (updateError) return fail(500, { actionFailed: true });

		return { completed: true };
	},

	reopen: async ({ params, locals }) => {
		if (!locals.user) redirect(303, `/auth/login?next=/tasks/${params.id}`);

		const { error: updateError } = await locals.supabase
			.from('tasks')
			.update({ status: 'in_progress' })
			.eq('id', params.id);

		if (updateError) return fail(500, { actionFailed: true });

		return { reopened: true };
	}
};
