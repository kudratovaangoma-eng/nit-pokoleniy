<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { LANGS, LANG_LABEL, lang, t } from '$lib/i18n';

	let { data, children } = $props();
	let loggedIn = $derived(Boolean(data.session));
	let path = $derived($page.url.pathname);
</script>

<header class="site-header">
	<div class="site-header__inner">
		<a class="site-header__name" href="/">
			<Logo size={30} id="header" />
			<span class="site-header__title">{$t('site.name')}</span>
		</a>

		<div class="site-header__actions">
			{#if loggedIn}
				<form method="POST" action="/auth/logout">
					<button class="btn btn--sm" type="submit">{$t('nav.logout')}</button>
				</form>
			{:else}
				<a class="btn btn--sm" href="/auth/login">{$t('nav.login')}</a>
			{/if}
		</div>

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

			<!--
				Выбор языка живёт здесь же, в панели навигации: в шапке его
				не находили. Все языки показаны сразу — переключатель с одной
				надписью на чужом языке не опознаётся как переключатель.
				Список берётся из LANGS: новый язык добавляется одной строкой
				там, а не здесь. Обычная форма, работает и без JS.
			-->
			<form method="POST" action="/lang" class="lang-switch" aria-label={$t('lang.label')}>
				<input type="hidden" name="redirectTo" value={path + $page.url.search} />
				{#each LANGS as code (code)}
					<button
						type="submit"
						name="lang"
						value={code}
						aria-current={$lang === code ? 'true' : undefined}
					>
						{LANG_LABEL[code]}
					</button>
				{/each}
			</form>
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
