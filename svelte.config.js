import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/**
 * adapter-auto сам подставляет нужный адаптер на хостинге
 * (на Cloudflare Pages — adapter-cloudflare).
 *
 * Почему не adapter-cloudflare напрямую: его эмуляция workerd в dev-режиме
 * на Windows валится с `write EOF` на каждом запросе. Приложению биндинги
 * Cloudflare (KV, D1, R2) не нужны — всё состояние в Supabase по HTTP,
 * так что терять на этом нечего.
 */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
