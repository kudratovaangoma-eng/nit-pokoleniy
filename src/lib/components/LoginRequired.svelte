<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	/** Просмотр открыт всем; вход нужен только чтобы что-то добавить. */
	let next = $derived($page.url.pathname + $page.url.search);
</script>

<p class="notice">{$t('auth.required')}</p>
<a class="btn btn--primary" href="/auth/login?next={encodeURIComponent(next)}">
	{$t('auth.loginToContinue')}
</a>
