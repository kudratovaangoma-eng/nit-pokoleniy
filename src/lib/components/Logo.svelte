<script lang="ts">
	/**
	 * Знак: одна нить проходит через три узла разного размера — три поколения,
	 * связанные общей памятью. Узел внизу самый крупный: старшие держат нить,
	 * от них она и тянется вверх.
	 *
	 * Градиент нужен свой на каждый экземпляр, иначе два знака на странице
	 * подерутся за один id.
	 */
	let { size = 28, id = 'logo' } = $props<{ size?: number; id?: string }>();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 32 32"
	fill="none"
	aria-hidden="true"
	style="flex: none"
>
	<defs>
		<linearGradient id="{id}-bg" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#e2600f" />
			<stop offset="1" stop-color="#8f2f0d" />
		</linearGradient>
	</defs>

	<rect width="32" height="32" rx="9.5" fill="url(#{id}-bg)" />

	<path
		d="M8.5 24.5C8.5 19.5 16 20.5 16 16C16 11.5 23.5 12.5 23.5 7.5"
		stroke="#FFE9D2"
		stroke-width="2.4"
		stroke-linecap="round"
		opacity="0.92"
	/>

	<circle cx="8.5" cy="24.5" r="3.4" fill="#FFE9D2" />
	<circle cx="16" cy="16" r="2.5" fill="#FFE9D2" />
	<circle cx="23.5" cy="7.5" r="1.9" fill="#FFE9D2" />
</svg>
