<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import { lang, plural, t } from '$lib/i18n';
	import TypeIcon from '$lib/components/TypeIcon.svelte';
	import { HERITAGE_TYPES } from '$lib/types';

	/**
	 * Фотографии разделов. Пока есть только рубоб — снимок с Викисклада
	 * под свободной лицензией; авторы указаны под плитками, этого требует
	 * CC BY-SA. У остальных разделов плитка остаётся с рисунком, пока не
	 * найдётся снимок по теме: плохое фото хуже честного значка.
	 */
	const PHOTOS: Record<string, string> = {
		song: '/photos/rubob.jpg'
	};

	let { data } = $props();
</script>

<svelte:head>
	<title>{$t('site.name')}</title>
	<meta name="description" content={$t('site.tagline')} />
</svelte:head>

<section class="hero">
	<h1>{$t('home.heroBefore')} <span class="hero__accent">{$t('home.heroAccent')}</span></h1>
	<p class="lead">{$t('home.lead')}</p>

	<!-- Два входа в проект прямо с обложки: посмотреть, что уже собрано,
	     и найти себе дело. Без них человек упирается в счётчики и уходит. -->
	<div class="hero__actions">
		<a class="btn btn--primary" href="/tasks">{$t('home.ctaHelp')}</a>
		<a class="btn" href="/archive">{$t('home.ctaBrowse')}</a>
	</div>

	<!--
		Хребет по нижнему краю обложки: всё, что здесь записывают, записывают
		в горах. Два плана дают глубину, снег лежит только на дальних пиках —
		как и бывает выше четырёх тысяч.
	-->
	<svg
		class="hero__ridge"
		viewBox="0 0 1200 170"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<path
			class="hero__ridge-far"
			d="M0 118 L120 58 L205 92 L320 28 L430 86 L545 44 L660 96 L780 38 L900 88 L1020 48 L1125 94 L1200 66 L1200 170 L0 170 Z"
		/>
		<path
			class="hero__ridge-snow"
			d="M320 28 L352 46 L338 44 L330 50 L318 44 L306 48 Z M780 38 L812 57 L798 54 L790 60 L778 54 L766 58 Z"
		/>
		<path
			class="hero__ridge-near"
			d="M0 145 L95 108 L185 134 L305 88 L425 128 L525 98 L645 138 L765 102 L885 140 L1005 110 L1125 143 L1200 124 L1200 170 L0 170 Z"
		/>
	</svg>
</section>

<section class="about">
	<div class="about__item">
		<span class="about__icon" aria-hidden="true"><Icon name="archive" size={20} /></span>
		<h2 class="about__title">{$t('about.archive.title')}</h2>
		<p class="about__text">{$t('about.archive.text')}</p>
	</div>
	<div class="about__item">
		<span class="about__icon" aria-hidden="true"><Icon name="people" size={20} /></span>
		<h2 class="about__title">{$t('about.people.title')}</h2>
		<p class="about__text">{$t('about.people.text')}</p>
	</div>
	<div class="about__item">
		<span class="about__icon" aria-hidden="true"><Icon name="tasks" size={20} /></span>
		<h2 class="about__title">{$t('about.tasks.title')}</h2>
		<p class="about__text">{$t('about.tasks.text')}</p>
	</div>
</section>

<section class="find">
	<form method="GET" action="/archive" class="find__form" role="search">
		<label class="find__label" for="home-q">{$t('home.searchLabel')}</label>
		<div class="find__row">
			<input
				id="home-q"
				name="q"
				type="search"
				placeholder={$t('archive.searchPlaceholder')}
				enterkeyhint="search"
			/>
			<button class="btn btn--primary" type="submit">{$t('common.find')}</button>
		</div>
	</form>

	<!-- Крупные входы в разделы архива: число под названием сразу показывает,
	     где уже есть что послушать, а где пока пусто. -->
	<ul class="types">
		{#each HERITAGE_TYPES as type (type)}
			<li>
				<a
					class="type-tile type-{type}"
					class:type-tile--photo={PHOTOS[type]}
					href="/archive?type={type}"
					style={PHOTOS[type] ? `background-image: url('${PHOTOS[type]}')` : undefined}
				>
					{#if !PHOTOS[type]}
						<span class="type-tile__icon"><TypeIcon {type} size={30} /></span>
					{/if}
					<span class="type-tile__name">{$t(`heritage.${type}`)}</span>
					<span class="type-tile__count">
						{data.typeCounts[type]}
						{plural($lang, data.typeCounts[type], 'home.counters.records')}
					</span>
				</a>
			</li>
		{/each}
	</ul>

	<p class="credits">
		{$t('home.photoCredit')}
		<a href="https://commons.wikimedia.org/wiki/File:Pamir_Rubab.jpg">Pamir Rubab</a>, Jo Dusepo,
		<a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>
	</p>
</section>

{#if data.loadError}
	<p class="notice notice--error">{$t('common.loadFailed')}</p>
{/if}

<!-- Счётчики стоят выше всего остального: человеку, которого позвали
     «сохранять культуру», нужно сразу увидеть, что дело уже идёт -->
<div class="counters">
	<div class="counter">
		<span class="counter__value">{data.counts.records}</span>
		<span class="counter__label">{plural($lang, data.counts.records, 'home.counters.records')}</span>
	</div>
	<div class="counter">
		<span class="counter__value">{data.counts.people}</span>
		<span class="counter__label">{plural($lang, data.counts.people, 'home.counters.people')}</span>
	</div>
	<div class="counter">
		<span class="counter__value">{data.counts.done}</span>
		<span class="counter__label">{plural($lang, data.counts.done, 'home.counters.done')}</span>
	</div>
</div>

<p class="notice">{$t('home.startHere')}</p>

<h2>{$t('home.openTasks')}</h2>
{#if data.loadError}
	<p class="muted">{$t('common.loadFailedShort')}</p>
{:else if data.openTasks.length === 0}
	<p class="muted">{$t('tasks.empty')}</p>
	<a class="btn btn--primary" href="/tasks/new">{$t('tasks.add')}</a>
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
	<p style="margin-top: 12px"><a href="/tasks">{$t('home.seeAll')}</a></p>
{/if}

<h2>{$t('home.latestRecords')}</h2>
{#if data.loadError}
	<p class="muted">{$t('common.loadFailedShort')}</p>
{:else if data.latestRecords.length === 0}
	<p class="muted">{$t('archive.empty')}</p>
	<a class="btn" href="/archive/new">{$t('archive.add')}</a>
{:else}
	<ul class="cards">
		{#each data.latestRecords as record (record.id)}
			<li>
				<a class="card card--typed type-{record.type}" href="/archive/{record.id}">
					<span class="badge">{$t(`heritage.${record.type}`)}</span>
					<h3>{record.title}</h3>
					<p class="card__carrier">{record.carrier_name}</p>
				</a>
			</li>
		{/each}
	</ul>
	<p style="margin-top: 12px"><a href="/archive">{$t('home.seeAll')}</a></p>
{/if}
