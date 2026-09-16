<script lang="ts">
	import MediaPlayer from '$lib/components/MediaPlayer.svelte';
	import { formatDate, lang, t } from '$lib/i18n';

	let { data } = $props();
	let record = $derived(data.record);
	// Supabase без сгенерированной схемы не выводит тип вложенного join'а,
	// поэтому разворачиваем его вручную.
	let recorderName = $derived.by(() => {
		const joined = record.recorder as { display_name: string }[] | { display_name: string } | null;
		if (!joined) return '';
		return (Array.isArray(joined) ? joined[0]?.display_name : joined.display_name) ?? '';
	});
</script>

<svelte:head><title>{record.title} — {$t('site.name')}</title></svelte:head>

<p><a class="btn--link" href="/archive">← {$t('archive.title')}</a></p>

<div class="stack type-{record.type}" style="gap: 8px">
	<span class="badge">{$t(`heritage.${record.type}`)}</span>
	{#if record.subtype}
		<a class="badge badge--soft" href="/archive?type={record.type}&subtype={record.subtype}">
			{$t(`subtype.${record.subtype}`)}
		</a>
	{/if}
</div>
<h1>{record.title}</h1>

<!-- Имя носителя стоит над материалом и набрано крупно: это авторство,
     а не служебная подпись. Обезличивать материал нельзя. -->
<p class="carrier">
	<span class="muted small">{$t('archive.carrier')}</span><br />
	{record.carrier_name}
</p>

<MediaPlayer
	kind={record.media_kind}
	path={record.media_url}
	body={record.body}
	title={record.title}
/>

<dl class="meta">
	{#if record.location}
		<dt>{$t('archive.location')}</dt>
		<dd>{record.location}</dd>
	{/if}
	{#if record.date_recorded}
		<dt>{$t('archive.date')}</dt>
		<dd>{formatDate($lang, record.date_recorded)}</dd>
	{/if}
	{#if recorderName}
		<dt>{$t('archive.recordedBy')}</dt>
		<dd>{recorderName}</dd>
	{/if}
</dl>

{#if data.tasks.length > 0}
	<h2>{$t('tasks.title')}</h2>
	<ul>
		{#each data.tasks as task (task.id)}
			<li><a href="/tasks/{task.id}">{task.title}</a></li>
		{/each}
	</ul>
{/if}

<style>
	.carrier {
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--accent-dark);
		margin-bottom: 20px;
	}

	.carrier .muted {
		font-weight: 400;
	}

	.meta {
		margin-top: 24px;
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 6px 16px;
	}

	.meta dt {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.meta dd {
		margin: 0;
	}
</style>
