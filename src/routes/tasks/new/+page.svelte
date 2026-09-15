<script lang="ts">
	import LoginRequired from '$lib/components/LoginRequired.svelte';
	import { t } from '$lib/i18n';

	let { data, form } = $props();

	// Две недели вперёд: подсказываем масштаб «маленького дела» самим значением
	const defaultDeadline = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);
</script>

<svelte:head><title>{$t('tasks.add')} — {$t('site.name')}</title></svelte:head>

<p><a class="btn--link" href="/tasks">← {$t('tasks.title')}</a></p>
<h1>{$t('tasks.add')}</h1>

{#if !data.canWrite}
	<LoginRequired />
{:else}
	{#if form?.missingFields}
		<p class="notice notice--error">{$t('tasks.needFields')}</p>
	{:else if form?.saveFailed}
		<p class="notice notice--error">{$t('common.error')}. {$t('common.tryAgain')}</p>
	{/if}

	<form method="POST">
		<div class="field">
			<label for="title">{$t('tasks.titleField')} <span class="required">{$t('common.required')}</span></label>
			<input
				id="title"
				name="title"
				type="text"
				required
				value={form?.title ?? ''}
				placeholder={$t('tasks.titlePlaceholder')}
			/>
		</div>

		<div class="field">
			<label for="description">{$t('tasks.description')}</label>
			<p class="field-hint">{$t('tasks.descriptionHint')}</p>
			<textarea
				id="description"
				name="description"
				placeholder={$t('tasks.descriptionPlaceholder')}>{form?.description ?? ''}</textarea
			>
		</div>

		<div class="field">
			<label for="deadline">{$t('tasks.deadline')} <span class="required">{$t('common.required')}</span></label>
			<p class="field-hint">{$t('tasks.deadlineHint')}</p>
			<input
				id="deadline"
				name="deadline"
				type="date"
				required
				value={form?.deadline || defaultDeadline}
			/>
		</div>

		<button class="btn btn--primary btn--wide" type="submit">{$t('common.save')}</button>
	</form>
{/if}
