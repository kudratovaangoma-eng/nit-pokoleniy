<script lang="ts">
	import { formatDate, lang, plural, t } from '$lib/i18n';
	import type { TaskStatus } from '$lib/types';

	let { id, title, deadline, status, responderCount = 0, resultTitle = '' } = $props<{
		id: string;
		title: string;
		deadline: string;
		status: TaskStatus;
		responderCount?: number;
		resultTitle?: string;
	}>();

	/** Сколько дней осталось — срочность должна читаться с карточки. */
	let daysLeft = $derived.by(() => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const due = new Date(deadline);
		due.setHours(0, 0, 0, 0);
		return Math.round((due.getTime() - today.getTime()) / 86_400_000);
	});
</script>

<a class="card" href="/tasks/{id}">
	<div class="stack" style="gap: 8px; margin-bottom: 6px">
		{#if status === 'done'}
			<span class="badge badge--ok">{$t('tasks.status.done')}</span>
		{:else if daysLeft < 0}
			<span class="badge badge--warn">{$t('tasks.overdue')}</span>
		{:else if daysLeft === 0}
			<span class="badge badge--warn">{$t('tasks.dueToday')}</span>
		{:else}
			<span class="badge">{$t('tasks.daysLeft', { n: daysLeft })}</span>
		{/if}
	</div>

	<h3>{title}</h3>
	<p class="card__meta">{$t('tasks.deadline')}: {formatDate($lang, deadline)}</p>

	{#if status === 'done' && resultTitle}
		<p class="card__meta">{$t('tasks.result')}: {resultTitle}</p>
	{:else if responderCount > 0}
		<!-- Число откликнувшихся видно сразу: присоединиться к делу,
		     которое кто-то уже начал, психологически проще -->
		<p class="card__carrier">{responderCount} {plural($lang, responderCount, 'tasks.responders')}</p>
	{:else}
		<p class="card__meta">{$t('tasks.respondersNone')}</p>
	{/if}
</a>
