import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import type { Lang } from '$lib/i18n';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			/** Проверяет JWT на сервере, а не доверяет куке. */
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			lang: Lang;
		}
		interface PageData {
			session: Session | null;
			lang: Lang;
		}
	}
}

export {};
