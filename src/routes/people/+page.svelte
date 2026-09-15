<script lang="ts">
	import EmptyState from '$lib/components/EmptyState.svelte';
	import FilterChips from '$lib/components/FilterChips.svelte';
	import { t } from '$lib/i18n';
	import { PERSON_ROLES, SKILL_TAGS, contactHref } from '$lib/types';

	let { data } = $props();

	let roleOptions = $derived(PERSON_ROLES.map((value) => ({ value, label: $t(`role.${value}`) })));
	let skillOptions = SKILL_TAGS.map((value) => ({ value, label: value }));
</script>

<svelte:head><title>{$t('people.title')} — {$t('site.name')}</title></svelte:head>

<h1>{$t('people.title')}</h1>
<p class="lead">{$t('people.subtitle')}</p>

<div class="page-actions">
	<a class="btn btn--primary" href="/people/new">{$t('people.add')}</a>
</div>

<form method="GET" class="filters">
	<div class="filters__search">
		<label class="visually-hidden" for="q">{$t('common.search')}</label>
		<input id="q" name="q" type="search" value={data.q} placeholder={$t('people.searchPlaceholder')} />
	</div>
	{#if data.role}<input type="hidden" name="role" value={data.role} />{/if}
	{#if data.skill}<input type="hidden" name="skill" value={data.skill} />{/if}
	<button class="btn" type="submit">{$t('common.find')}</button>
</form>

<FilterChips param="role" options={roleOptions} current={data.role} />
<FilterChips param="skill" options={skillOptions} current={data.skill} />

{#if data.loadError}
	<p class="notice notice--error">{$t('common.loadFailed')}</p>
{:else if data.people.length === 0}
	<EmptyState
		text={data.q || data.role || data.skill ? $t('people.emptyFiltered') : $t('people.empty')}
		actionHref={data.q || data.role || data.skill ? '' : '/people/new'}
		actionLabel={$t('people.add')}
	/>
{:else}
	<ul class="cards">
		{#each data.people as person (person.id)}
			<li class="card">
				<span class="badge" class:badge--ok={person.role === 'helper'}>
					{$t(`role.${person.role}`)}
				</span>
				<h3>{person.name}</h3>
				{#if person.skills_or_knowledge}
					<p>{person.skills_or_knowledge}</p>
				{/if}
				{#if person.location}
					<p class="card__meta">{person.location}</p>
				{/if}
				{#if person.skill_tags?.length}
					<div class="tags">
						{#each person.skill_tags as tag (tag)}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}

				<!-- Вместо внутреннего чата — прямой контакт: люди здесь
				     созваниваются и встречаются, а не переписываются в системе -->
				<div class="stack" style="margin-top: 12px">
					{#if contactHref(person.contact)}
						<a class="btn" href={contactHref(person.contact)}>
							{person.contact.startsWith('@') ? $t('people.write') : $t('people.call')}
						</a>
						<span class="small muted">{person.contact}</span>
					{:else if person.contact}
						<span class="small muted">{person.contact}</span>
					{:else}
						<span class="small muted">{$t('people.noContact')}</span>
					{/if}
				</div>
			</li>
		{/each}
	</ul>
{/if}
