<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import { t } from '$lib/i18n';

	let { data, children } = $props();
	let loggedIn = $derived(Boolean(data.session));
	let path = $derived($page.url.pathname);
</script>

<header class="site-header">
	<div class="site-header__inner">
		<a class="site-header__name" href="/">
			<svg class="site-header__mark" viewBox="0 0 32 32" aria-hidden="true">
				<rect width="32" height="32" rx="9" fill="var(--accent)" />
				<path
					d="M8 7C24 11 8 21 24 25"
					fill="none"
					stroke="var(--accent-soft)"
					stroke-width="3"
					stroke-linecap="round"
				/>
				<circle cx="8" cy="7" r="2.6" fill="var(--accent-soft)" />
				<circle cx="24" cy="25" r="2.6" fill="var(--accent-soft)" />
			</svg>
			{$t('site.name')}
		</a>

		<!-- Смена языка и выход — обычные формы: работают и без JS -->
		<form method="POST" action="/lang">
			<input type="hidden" name="redirectTo" value={path + $page.url.search} />
			<button class="btn btn--link" type="submit">{$t('lang.switch')}</button>
		</form>

		{#if loggedIn}
			<form method="POST" action="/auth/logout">
				<button class="btn btn--link" type="submit">{$t('nav.logout')}</button>
			</form>
		{:else}
			<a class="btn btn--link" href="/auth/login">{$t('nav.login')}</a>
		{/if}

		<!-- На телефоне эта панель уезжает вниз экрана, под большой палец -->
		<nav class="nav" aria-label={$t('site.name')}>
			<a href="/" aria-current={path === '/' ? 'page' : undefined}>
				<Icon name="home" />
				{$t('nav.home')}
			</a>
			<a href="/archive" aria-current={path.startsWith('/archive') ? 'page' : undefined}>
				<Icon name="archive" />
				{$t('nav.archive')}
			</a>
			<a href="/people" aria-current={path.startsWith('/people') ? 'page' : undefined}>
				<Icon name="people" />
				{$t('nav.people')}
			</a>
			<a href="/tasks" aria-current={path.startsWith('/tasks') ? 'page' : undefined}>
				<Icon name="tasks" />
				{$t('nav.tasks')}
			</a>
		</nav>
	</div>
</header>

<main class="container">
	{#if !data.supabaseConfigured}
		<!-- Без ключей Supabase вход и сохранение не работают. Молчать об этом
		     нельзя: человек решит, что сломаны кнопки, а не настройка. -->
		<p class="notice notice--error">{$t('setup.noDatabase')}</p>
	{/if}
	{@render children()}
</main>
