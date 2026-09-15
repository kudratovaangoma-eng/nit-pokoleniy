import { supabaseConfigured } from '$lib/supabase';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	let displayName = '';
	if (locals.user) {
		const { data } = await locals.supabase
			.from('profiles')
			.select('display_name')
			.eq('id', locals.user.id)
			.maybeSingle();
		displayName = data?.display_name ?? '';
	}

	return {
		session: locals.session,
		lang: locals.lang,
		userId: locals.user?.id ?? null,
		displayName,
		supabaseConfigured
	};
};
