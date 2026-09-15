<script lang="ts">
	import { page } from '$app/stores';
	import { t } from '$lib/i18n';

	/**
	 * Фильтры — обычные ссылки с параметром в адресе: работают без JS,
	 * кнопка «назад» ведёт себя ожидаемо, отфильтрованной лентой можно
	 * поделиться ссылкой в Telegram — а так здесь и зовут людей.
	 */
	let { param, options, current } = $props<{
		param: string;
		options: { value: string; label: string }[];
		current: string;
	}>();

	function hrefFor(value: string): string {
		const url = new URL($page.url);
		if (value) url.searchParams.set(param, value);
		else url.searchParams.delete(param);
		return url.pathname + url.search;
	}
</script>

<div class="chips">
	<a class="chip" href={hrefFor('')} aria-current={current === '' ? 'true' : undefined}>
		{$t('common.all')}
	</a>
	{#each options as option (option.value)}
		<a
			class="chip"
			href={hrefFor(option.value)}
			aria-current={current === option.value ? 'true' : undefined}
		>
			{option.label}
		</a>
	{/each}
</div>
