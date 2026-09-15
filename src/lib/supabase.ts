import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

/** Заполнены ли ключи в .env, или там всё ещё заглушки. */
export const supabaseConfigured =
	!PUBLIC_SUPABASE_URL.includes('example.supabase.co') && PUBLIC_SUPABASE_ANON_KEY !== 'replace-me';

/** Ответа ждём столько; дальше честнее показать ошибку, чем белый экран. */
const READ_TIMEOUT_MS = 12_000;
/** Загрузка файла с телефона по мобильному интернету идёт минутами. */
const UPLOAD_TIMEOUT_MS = 10 * 60_000;

/**
 * fetch для запросов к Supabase.
 *
 * Две задачи. Первая: не висеть. При обрыве связи (обычное дело там, где
 * люди будут этим пользоваться) запрос уходит в таймаут ОС на десятки
 * секунд — всё это время человек смотрит на пустой экран. Лучше быстро
 * сказать «нет связи».
 *
 * Вторая: пока в .env заглушки, вообще не ходить в сеть. Иначе каждая
 * страница ждёт несуществующий хост и открывается семь секунд.
 */
export async function supabaseFetch(
	input: RequestInfo | URL,
	init?: RequestInit
): Promise<Response> {
	if (!supabaseConfigured) return unavailable('Supabase не настроен: в .env заглушки вместо ключей');

	const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
	const isUpload = url.includes('/storage/v1/object/') && init?.method !== 'GET';
	const timeout = AbortSignal.timeout(isUpload ? UPLOAD_TIMEOUT_MS : READ_TIMEOUT_MS);

	try {
		return await fetch(input, {
			...init,
			signal: init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout
		});
	} catch (error) {
		// Важно вернуть ОТВЕТ, а не бросить исключение: на исключении
		// supabase-js уходит в серию повторов с нарастающими паузами —
		// восемь попыток превращают мгновенный отказ в семь секунд ожидания.
		return unavailable(error instanceof Error ? error.message : 'нет связи');
	}
}

/**
 * Ответ «связи нет» в формате, который понимает supabase-js.
 *
 * Код намеренно 400, а не 503: пятисотые клиент считает временными и
 * повторяет с паузами, растягивая отказ на секунды. Нам нужен отказ сразу.
 */
function unavailable(message: string): Response {
	return new Response(JSON.stringify({ message, code: 'unavailable', hint: null, details: null }), {
		status: 400,
		headers: { 'content-type': 'application/json' }
	});
}

/**
 * Клиент для браузера. Данные страниц грузятся на сервере (+page.server.ts),
 * поэтому здесь он нужен только для двух вещей: вход/выход и загрузка файла
 * напрямую в Storage — гонять медиа через наш сервер на слабом интернете
 * значит удваивать трафик.
 */
export function browserClient(): SupabaseClient {
	if (!client) {
		client = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			global: { fetch: supabaseFetch }
		});
	}
	return client;
}

/** Публичная ссылка на файл в bucket `media`. */
export function mediaUrl(path: string | null): string | null {
	if (!path) return null;
	if (/^https?:\/\//.test(path)) return path;
	return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
