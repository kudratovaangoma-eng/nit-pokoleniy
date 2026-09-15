import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	canWrite: Boolean(locals.user)
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/auth/login?next=/tasks/new');

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const description = String(form.get('description') ?? '').trim();
		const deadline = String(form.get('deadline') ?? '').trim();

		const values = { title, description, deadline };

		// Срок обязателен: дело без срока превращается в ту самую абстрактную
		// миссию, на которую никто не откликается.
		if (!title || !deadline) {
			return fail(400, { ...values, missingFields: true });
		}

		const { data, error } = await locals.supabase
			.from('tasks')
			.insert({
				title,
				description,
				deadline,
				status: 'open',
				created_by: locals.user.id
			})
			.select('id')
			.single();

		if (error || !data) return fail(500, { ...values, saveFailed: true });

		redirect(303, `/tasks/${data.id}`);
	}
};
