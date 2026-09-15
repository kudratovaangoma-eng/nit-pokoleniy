import { redirect } from '@sveltejs/kit';
import { LANG_COOKIE } from '$lib/i18n';
import type { RequestHandler } from './$types';

/** Переключение языка обычной формой — работает и с выключенным JS. */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const form = await request.formData();
	const redirectTo = String(form.get('redirectTo') || '/');
	const next = locals.lang === 'ru' ? 'tg' : 'ru';

	cookies.set(LANG_COOKIE, next, {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365
	});

	// Открытый редирект недопустим: принимаем только внутренние адреса.
	redirect(303, redirectTo.startsWith('/') ? redirectTo : '/');
};
