import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/** Человек открыл ссылку из письма — меняем одноразовый код на сессию. */
export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	const nextParam = url.searchParams.get('next') ?? '/';
	const next = nextParam.startsWith('/') ? nextParam : '/';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, next);
	}

	// Ссылка устарела или открыта на другом устройстве — просим войти заново.
	redirect(303, '/auth/login?expired=1');
};
