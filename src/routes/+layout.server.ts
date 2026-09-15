import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { LayoutServerLoad } from './$types';

/**
 * Пока в .env заглушки, вход и любое сохранение молча возвращают ошибку —
 * со стороны это выглядит как «кнопки не работают». Поэтому говорим прямо.
 */
const supabaseConfigured =
	!PUBLIC_SUPABASE_URL.includes('example.supabase.co') && PUBLIC_SUPABASE_ANON_KEY !== 'replace-me';

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
