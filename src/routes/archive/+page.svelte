<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import FilterChips from '$lib/components/FilterChips.svelte';
	import { formatDate, lang, t } from '$lib/i18n';
	import { HERITAGE_TYPES } from '$lib/types';

	let { data } = $props();

	const ICONS: Record<string, string> = {
		song: '🎵',
		ritual: '🕯️',
		craft: '🧵',
		oral_history: '🗣️'
	};

	let typeOptions = $derived(
		HERITAGE_TYPES.map((value) => ({ value, label: $t(`heritage.${value}`) }))
	);
</script>

<svelte:head><title>{$t('archive.title')} — {$t('site.name')}</title></svelte:head>

<h1>{$t('archive.title')}</h1>
<p class="lead">{$t('archive.subtitle')}</p>

<div class="page-actions">
	<a class="btn btn--primary" href="/archive/new">{$t('archive.add')}</a>
</div>

<form method="GET" class="filters">
	<div class="filters__search">
		<label class="visually-hidden" for="q">{$t('common.search')}</label>
		<input
			id="q"
			name="q"
			type="search"
			value={data.q}
			placeholder={$t('archive.searchPlaceholder')}
		/>
	</div>
	{#if data.type}
		<input type="hidden" name="type" value={data.type} />
	{/if}
	<button class="btn" type="submit">{$t('common.find')}</button>
</form>

<FilterChips param="type" options={typeOptions} current={data.type} />

<!-- Если лента не загрузилась, нельзя писать «ничего не нашлось»: человек
     решит, что фильтр отработал и записей просто нет. -->
{#if data.loadError}
	<p class="notice notice--error">{$t('common.loadFailed')}</p>
{:else if data.records.length === 0}
	<EmptyState
		text={data.q || data.type ? $t('archive.emptyFiltered') : $t('archive.empty')}
		actionHref={data.q || data.type ? '' : '/archive/new'}
		actionLabel={$t('archive.add')}
	/>
{:else}
	<ul class="cards">
		{#each data.records as record (record.id)}
			<li>
				<a class="card" href="/archive/{record.id}">
					<div class="card__head">
						<span class="card__icon" aria-hidden="true">{ICONS[record.type]}</span>
						<div class="card__head-text">
							<span class="badge">{$t(`heritage.${record.type}`)}</span>
							<h3 style="margin-top: 8px">{record.title}</h3>
						</div>
					</div>
					<!-- Имя носителя — на карточке, а не только внутри: материал
					     не должен появляться нигде без человека, от которого он получен -->
					<p class="card__carrier">{record.carrier_name}</p>
					<p class="card__meta">
						{record.location || $t('common.notSpecified')}{record.date_recorded
							? ' · ' + formatDate($lang, record.date_recorded)
							: ''}
					</p>
				</a>
			</li>
		{/each}
	</ul>
{/if}
