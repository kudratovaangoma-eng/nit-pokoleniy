<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import { t } from '$lib/i18n';

	let { data } = $props();

	function resultTitle(task: { result_record?: { title: string }[] | { title: string } | null }) {
		const record = Array.isArray(task.result_record) ? task.result_record[0] : task.result_record;
		return record?.title ?? '';
	}
</script>

<svelte:head><title>{$t('tasks.title')} — {$t('site.name')}</title></svelte:head>

<h1>{$t('tasks.title')}</h1>
<p class="lead">{$t('tasks.subtitle')}</p>

<div class="page-actions">
	<a class="btn btn--primary" href="/tasks/new">{$t('tasks.add')}</a>
	<a class="btn" href="/tasks/mine">{$t('nav.mine')}</a>
</div>

{#if data.loadError}
	<p class="notice notice--error">{$t('common.error')}. {$t('common.tryAgain')}</p>
{/if}

<h2>{$t('tasks.openSection')}</h2>
{#if data.openTasks.length === 0}
	<EmptyState text={$t('tasks.empty')} actionHref="/tasks/new" actionLabel={$t('tasks.add')} />
{:else}
	<ul class="cards">
		{#each data.openTasks as task (task.id)}
			<li>
				<TaskCard
					id={task.id}
					title={task.title}
					deadline={task.deadline}
					status={task.status}
					responderCount={task.responder_count}
				/>
			</li>
		{/each}
	</ul>
{/if}

{#if data.doneTasks.length > 0}
	<h2>{$t('tasks.doneSection')}</h2>
	<ul class="cards">
		{#each data.doneTasks as task (task.id)}
			<li>
				<TaskCard
					id={task.id}
					title={task.title}
					deadline={task.deadline}
					status={task.status}
					resultTitle={resultTitle(task)}
				/>
			</li>
		{/each}
	</ul>
{/if}
