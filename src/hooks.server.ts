import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import { DEFAULT_LANG, LANG_COOKIE, isLang } from '$lib/i18n';
import { supabaseFetch } from '$lib/supabase';
import type { SetAllCookies } from '@supabase/ssr';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		// свой fetch: с таймаутом, чтобы страница не ждала мёртвую связь
		global: { fetch: supabaseFetch },
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet: Parameters<SetAllCookies>[0]) => {
				for (const { name, value, options } of cookiesToSet) {
					event.cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});

	/**
	 * getSession() читает куку и не проверяет подпись, поэтому сначала
	 * подтверждаем пользователя через getUser() — он ходит в Supabase.
	 */
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;

	const cookieLang = event.cookies.get(LANG_COOKIE);
	event.locals.lang = isLang(cookieLang) ? cookieLang : DEFAULT_LANG;

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.lang),
		// Supabase требует пропускать свои заголовки авторизации наружу
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
