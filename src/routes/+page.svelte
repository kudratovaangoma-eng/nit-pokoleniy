<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import TaskCard from '$lib/components/TaskCard.svelte';
	import { lang, plural, t } from '$lib/i18n';

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
