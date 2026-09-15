<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';
</script>

<h1>{$page.status === 404 ? $t('error.notFound') : $t('common.error')}</h1>
<p class="lead">{$page.error?.message}</p>
<a class="btn btn--primary" href="/">{$t('nav.home')}</a>
