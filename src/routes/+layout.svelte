<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	let { data, children } = $props();
	let loggedIn = $derived(Boolean(data.session));
</script>

<header class="site-header">
	<div class="site-header__inner">
		<a class="site-header__name" href="/">{$t('site.name')}</a>

		<!-- Смена языка и выход — обычные формы: работают и без JS -->
		<form method="POST" action="/lang">
			<input type="hidden" name="redirectTo" value={$page.url.pathname + $page.url.search} />
			<button class="btn btn--link" type="submit">{$t('lang.switch')}</button>
		</form>

		{#if loggedIn}
			<form method="POST" action="/auth/logout">
				<button class="btn btn--link" type="submit">{$t('nav.logout')}</button>
			</form>
		{:else}
			<a class="btn btn--link" href="/auth/login">{$t('nav.login')}</a>
		{/if}

		<nav class="nav" aria-label={$t('site.name')}>
			<a href="/" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>{$t('nav.home')}</a>
			<a href="/archive" aria-current={$page.url.pathname.startsWith('/archive') ? 'page' : undefined}
				>{$t('nav.archive')}</a
			>
			<a href="/people" aria-current={$page.url.pathname.startsWith('/people') ? 'page' : undefined}
				>{$t('nav.people')}</a
			>
			<a href="/tasks" aria-current={$page.url.pathname.startsWith('/tasks') ? 'page' : undefined}
				>{$t('nav.tasks')}</a
			>
		</nav>
	</div>
</header>

<main class="container">
	{@render children()}
</main>
