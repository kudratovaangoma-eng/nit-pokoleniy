<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import LoginRequired from '$lib/components/LoginRequired.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import { t } from '$lib/i18n';

	let { data } = $props();
	let nothing = $derived(data.created.length === 0 && data.joined.length === 0);
</script>

<svelte:head><title>{$t('nav.mine')} — {$t('site.name')}</title></svelte:head>

<p><a class="btn--link" href="/tasks">← {$t('tasks.title')}</a></p>
<h1>{$t('nav.mine')}</h1>

{#if !data.canWrite}
	<LoginRequired />
{:else if nothing}
	<EmptyState text={$t('tasks.mineEmpty')} actionHref="/tasks" actionLabel={$t('tasks.title')} />
{:else}
	{#if data.joined.length > 0}
		<h2>{$t('tasks.mineJoined')}</h2>
		<ul class="cards">
			{#each data.joined as task (task.id)}
				<li>
					<TaskCard id={task.id} title={task.title} deadline={task.deadline} status={task.status} />
				</li>
			{/each}
		</ul>
	{/if}

	{#if data.created.length > 0}
		<h2>{$t('tasks.mineCreated')}</h2>
		<ul class="cards">
			{#each data.created as task (task.id)}
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
{/if}
