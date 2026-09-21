<script lang="ts">
	import LoginRequired from '$lib/components/LoginRequired.svelte';
	import { t } from '$lib/i18n';
	import { PERSON_ROLES, SKILL_TAGS } from '$lib/types';

	let { data, form } = $props();

	// svelte-ignore state_referenced_locally
	let isSelf = $state(form?.isSelf ?? true);
	// svelte-ignore state_referenced_locally
	let role = $state(form?.role ?? 'helper');

	let skillsPlaceholder = $derived(
		role === 'carrier' ? $t('people.skillsPlaceholderCarrier') : $t('people.skillsPlaceholderHelper')
	);
</script>

<svelte:head><title>{$t('people.add')} — {$t('site.name')}</title></svelte:head>

<p><a class="btn--link" href="/people">← {$t('people.title')}</a></p>
<h1>{$t('people.add')}</h1>

{#if !data.canWrite}
	<LoginRequired />
{:else}
	<p class="lead">{$t('people.addHint')}</p>

	{#if form?.missingFields}
		<p class="notice notice--error">{$t('people.needFields')}</p>
	{:else if form?.saveFailed}
		<p class="notice notice--error">{$t('common.error')}. {$t('common.tryAgain')}</p>
	{/if}

	<form method="POST">
		<div class="field">
			<label for="is_self" class="stack">
				<input id="is_self" name="is_self" type="checkbox" bind:checked={isSelf} style="width: auto; min-height: 0" />
				<span>{$t('people.addingSelf')}</span>
			</label>
		</div>

		<div class="field">
			<label for="name">{$t('people.name')} <span class="required">{$t('common.required')}</span></label>
			<!-- «Добавляю себя» — самый частый случай, поэтому имя подставлено сразу -->
			<input
				id="name"
				name="name"
				type="text"
				required
				value={form?.name ?? data.displayName ?? ''}
				placeholder={$t('people.namePlaceholder')}
			/>
		</div>

		<fieldset class="field" style="border: 0; padding: 0; margin-inline: 0">
			<legend>{$t('people.role')}</legend>
			{#each PERSON_ROLES as value (value)}
				<label class="stack" style="font-weight: 400; margin-bottom: 8px">
					<input type="radio" name="role" {value} bind:group={role} style="width: auto; min-height: 0" />
					<span>{$t(`role.${value}`)} — {$t(`role.${value}.hint`)}</span>
				</label>
			{/each}
		</fieldset>

		<div class="field">
			<label for="skills">{$t('people.skills')}</label>
			<input
				id="skills"
				name="skills_or_knowledge"
				type="text"
				value={form?.skills ?? ''}
				placeholder={skillsPlaceholder}
			/>
		</div>

		<fieldset class="field" style="border: 0; padding: 0; margin-inline: 0">
			<legend>{$t('people.skillTags')}</legend>
			<div class="tags">
				{#each SKILL_TAGS as tag (tag)}
					<label class="chip" style="font-weight: 400">
						<input
							type="checkbox"
							name="skill_tags"
							value={tag}
							checked={form?.tags?.includes(tag) ?? false}
							style="width: auto; min-height: 0; margin-right: 6px"
						/>
						{$t(`skill.${tag}`)}
					</label>
				{/each}
			</div>
		</fieldset>

		<div class="field">
			<label for="location">{$t('people.location')}</label>
			<input id="location" name="location" type="text" value={form?.location ?? ''} />
		</div>

		<div class="field">
			<label for="contact">{$t('people.contact')}</label>
			<p class="field-hint">{$t('people.contactHint')}</p>
			<input id="contact" name="contact" type="text" value={form?.contact ?? ''} placeholder="+992 900 00 00 00" />
		</div>

		<button class="btn btn--primary btn--wide" type="submit">{$t('common.save')}</button>
	</form>
{/if}
