import { DEMO_PEOPLE } from '$lib/demo';
import { supabaseConfigured } from '$lib/supabase';
import { PERSON_ROLES, type PersonRole } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, locals }) => {
	const role = url.searchParams.get('role') ?? '';
	const skill = url.searchParams.get('skill') ?? '';
	const q = (url.searchParams.get('q') ?? '').trim();

	if (!supabaseConfigured) {
		const needle = q.toLowerCase();
		const people = DEMO_PEOPLE.filter(
			(p) =>
				(!role || p.role === role) &&
				(!skill || p.skill_tags.includes(skill)) &&
				(!needle ||
					[p.name, p.skills_or_knowledge, p.location].some((f) => f.toLowerCase().includes(needle)))
		);
		return { people, role, skill, q, loadError: false, demo: true };
	}

	let query = locals.supabase
		.from('people')
		.select('id, name, role, skills_or_knowledge, skill_tags, location, contact, created_at')
		.order('created_at', { ascending: false })
		.limit(100);

	if (PERSON_ROLES.includes(role as PersonRole)) query = query.eq('role', role);
	if (skill) query = query.contains('skill_tags', [skill]);

	if (q) {
		const escaped = q.replace(/[%,()]/g, ' ');
		query = query.or(
			`name.ilike.%${escaped}%,skills_or_knowledge.ilike.%${escaped}%,location.ilike.%${escaped}%`
		);
	}

	const { data, error } = await query;

	return { people: data ?? [], role, skill, q, loadError: Boolean(error), demo: false };
};
