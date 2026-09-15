import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => ({
	// куда вернуть человека после входа — например, к форме, которую он открыл
	next: url.searchParams.get('next') ?? '/',
	expired: url.searchParams.has('expired')
});

export const actions: Actions = {
	default: async ({ request, locals, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const displayName = String(form.get('display_name') ?? '').trim();
		const next = String(form.get('next') ?? '/');

		if (!email || !email.includes('@')) {
			return fail(400, { email, displayName, invalidEmail: true });
		}

		const redirectTo = new URL('/auth/callback', url.origin);
		redirectTo.searchParams.set('next', next.startsWith('/') ? next : '/');

		const { error } = await locals.supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: redirectTo.toString(),
				// подхватится триггером handle_new_user при первом входе
				data: displayName ? { display_name: displayName } : undefined
			}
		});

		if (error) {
			return fail(500, { email, displayName, failed: true });
		}

		return { sent: true, email };
	}
};
