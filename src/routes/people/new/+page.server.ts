import { fail, redirect } from '@sveltejs/kit';
import { PERSON_ROLES, SKILL_TAGS, type PersonRole } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) return { canWrite: false, displayName: '' };

	const { data } = await locals.supabase
		.from('profiles')
		.select('display_name')
		.eq('id', locals.user.id)
		.maybeSingle();

	return { canWrite: true, displayName: data?.display_name ?? '' };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) redirect(303, '/auth/login?next=/people/new');

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const role = String(form.get('role') ?? '') as PersonRole;
		const skills = String(form.get('skills_or_knowledge') ?? '').trim();
		const location = String(form.get('location') ?? '').trim();
		const contact = String(form.get('contact') ?? '').trim();
		const isSelf = form.get('is_self') === 'on';
		const tags = form
			.getAll('skill_tags')
			.map(String)
			.filter((tag) => (SKILL_TAGS as readonly string[]).includes(tag));

		const values = { name, role, skills, location, contact, tags, isSelf };

		if (!name || !PERSON_ROLES.includes(role)) {
			return fail(400, { ...values, missingFields: true });
		}

		const { error } = await locals.supabase.from('people').insert({
			name,
			role,
			skills_or_knowledge: skills,
			skill_tags: tags,
			location,
			contact,
			// профиль привязываем, только если человек добавляет себя:
			// анкету носителя обычно заполняет помощник
			profile_id: isSelf ? locals.user.id : null,
			added_by: locals.user.id
		});

		if (error) return fail(500, { ...values, saveFailed: true });

		redirect(303, '/people');
	}
};
