<script lang="ts">
	/**
	 * Иконки нарисованы вручную вместо иконочной библиотеки: четыре штуки
	 * не стоят ни лишнего запроса, ни килобайтов на слабом интернете.
	 */
	let { name, size = 22 } = $props<{ name: 'home' | 'archive' | 'people' | 'tasks'; size?: number }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="1.9"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'home'}
		<path d="M3 10.5 12 3l9 7.5" />
		<path d="M5.5 9.5V20h13V9.5" />
	{:else if name === 'archive'}
		<!-- микрофон: архив — это прежде всего записанные голоса -->
		<rect x="9" y="2.5" width="6" height="11" rx="3" />
		<path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
		<path d="M12 17.5V21" />
	{:else if name === 'people'}
		<circle cx="9" cy="8" r="3.2" />
		<path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
		<path d="M16 5.2a3.2 3.2 0 0 1 0 5.9" />
		<path d="M17.5 14.9c2.1.6 3.5 2.4 3.5 5.1" />
	{:else if name === 'tasks'}
		<path d="M3.5 7.5h11" />
		<path d="M3.5 12.5h8" />
		<path d="M3.5 17.5h6" />
		<path d="m15 16 2.5 2.5L22 14" />
	{/if}
</svg>
