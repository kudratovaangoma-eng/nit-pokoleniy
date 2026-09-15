<script lang="ts">
	import LoginRequired from '$lib/components/LoginRequired.svelte';
	import { formatDate, lang, plural, t } from '$lib/i18n';

	let { data, form } = $props();

	let task = $derived(data.task);
	let author = $derived(Array.isArray(task.author) ? task.author[0] : task.author);
	let resultRecord = $derived(
		Array.isArray(task.result_record) ? task.result_record[0] : task.result_record
	);
	let count = $derived(data.responders.length);

	function personOf(row: { profiles?: { display_name: string }[] | { display_name: string } | null }) {
		return Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
	}
</script>

<svelte:head><title>{task.title} — {$t('site.name')}</title></svelte:head>

<p><a class="btn--link" href="/tasks">← {$t('tasks.title')}</a></p>

<span class="badge" class:badge--ok={task.status === 'done'}>
	{$t(`tasks.status.${task.status}`)}
</span>
<h1>{task.title}</h1>

<p class="card__meta">
	{$t('tasks.deadline')}: <strong>{formatDate($lang, task.deadline)}</strong>
	{#if author?.display_name}
		· {$t('tasks.createdBy')} {author.display_name}
	{/if}
</p>

{#if task.description}
	<p style="white-space: pre-wrap">{task.description}</p>
{/if}

{#if form?.actionFailed}
	<p class="notice notice--error">{$t('common.error')}. {$t('common.tryAgain')}</p>
{/if}

{#if task.status === 'done'}
	<div class="notice notice--ok">
		<strong>{$t('tasks.status.done')}</strong>
		{#if resultRecord}
			<p style="margin: 6px 0 0">
				{$t('tasks.result')}: <a href="/archive/{resultRecord.id}">{resultRecord.title}</a>
			</p>
		{/if}
	</div>
{/if}

<h2>{$t('tasks.respondersList')}</h2>
{#if count === 0}
	<p class="muted">{$t('tasks.respondersNone')}</p>
{:else}
	<p class="card__carrier">{count} {plural($lang, count, 'tasks.responders')}</p>
	<ul>
		{#each data.responders as responder (responder.profile_id)}
			{@const person = personOf(responder)}
			<li>{person?.display_name || '—'}</li>
		{/each}
	</ul>
{/if}

{#if !data.canWrite}
	<LoginRequired />
{:else}
	<div class="page-actions" style="margin-top: 24px">
		{#if data.hasResponded}
			<span class="badge badge--ok">{$t('tasks.responded')}</span>
			<form method="POST" action="?/withdraw">
				<button class="btn" type="submit">{$t('tasks.cancelResponse')}</button>
			</form>
		{:else if task.status !== 'done'}
			<form method="POST" action="?/respond">
				<button class="btn btn--primary" type="submit">{$t('tasks.respond')}</button>
			</form>
		{/if}
	</div>

	{#if task.status !== 'done'}
		<h2>{$t('tasks.markDone')}</h2>
		<form method="POST" action="?/complete">
			<div class="field">
				<label for="result_record_id">{$t('tasks.attachResult')}</label>
				<p class="field-hint">{$t('tasks.attachResultHint')}</p>
				<select id="result_record_id" name="result_record_id">
					<option value="">—</option>
					{#each data.myRecords as record (record.id)}
						<option value={record.id}>{record.title}</option>
					{/each}
				</select>
			</div>
			<div class="stack">
				<button class="btn btn--primary" type="submit">{$t('tasks.markDone')}</button>
				<a class="btn" href="/archive/new">{$t('archive.add')}</a>
			</div>
		</form>
	{:else}
		<form method="POST" action="?/reopen" style="margin-top: 16px">
			<button class="btn" type="submit">{$t('tasks.reopen')}</button>
		</form>
	{/if}
{/if}
