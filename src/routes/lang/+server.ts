import { redirect } from '@sveltejs/kit';
import { LANGS, LANG_COOKIE, isLang } from '$lib/i18n';
import type { RequestHandler } from './$types';

/** Выбор языка обычной формой — работает и с выключенным JS. */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const form = await request.formData();
	const redirectTo = String(form.get('redirectTo') || '/');

	// Язык выбирают явной кнопкой; перебор по кругу остаётся запасным
	// вариантом, если поле почему-то не пришло.
	const requested = form.get('lang');
	const next = isLang(requested)
		? requested
		: LANGS[(LANGS.indexOf(locals.lang) + 1) % LANGS.length];

	cookies.set(LANG_COOKIE, next, {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365
	});

	// Открытый редирект недопустим: принимаем только внутренние адреса.
	redirect(303, redirectTo.startsWith('/') ? redirectTo : '/');
};
