import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/**
 * Клиент для браузера. Данные страниц грузятся на сервере (+page.server.ts),
 * поэтому здесь он нужен только для двух вещей: вход/выход и загрузка файла
 * напрямую в Storage — гонять медиа через наш сервер на слабом интернете
 * значит удваивать трафик.
 */
export function browserClient(): SupabaseClient {
	if (!client) {
		client = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);
	}
	return client;
}

/** Публичная ссылка на файл в bucket `media`. */
export function mediaUrl(path: string | null): string | null {
	if (!path) return null;
	if (/^https?:\/\//.test(path)) return path;
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
