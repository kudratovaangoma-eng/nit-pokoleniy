<script lang="ts">
	/**
	 * Пусто — это не ошибка. Для сообщества, которое ещё не началось,
	 * пустой экран должен объяснять первый шаг, а не сообщать «нет данных».
	 */
	let { text, actionHref = '', actionLabel = '' } = $props<{
		text: string;
		actionHref?: string;
		actionLabel?: string;
	}>();
</script>

<div class="empty">
	<p>{text}</p>
	{#if actionHref && actionLabel}
		<a class="btn btn--primary" href={actionHref}>{actionLabel}</a>
	{/if}
</div>
