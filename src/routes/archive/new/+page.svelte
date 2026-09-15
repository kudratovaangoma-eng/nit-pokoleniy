<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import LoginRequired from '$lib/components/LoginRequired.svelte';
	import { compressImage } from '$lib/compressImage';
	import { t } from '$lib/i18n';
	import { HERITAGE_TYPES, subtypesOf } from '$lib/types';

	let { data, form } = $props();

	const DRAFT_KEY = 'archive-draft';
	const LAST_LOCATION_KEY = 'archive-last-location';

	// Начальные значения берутся из form один раз — так и задумано:
	// дальше поля живут своей жизнью и пишутся в черновик.
	// svelte-ignore state_referenced_locally
	let title = $state(form?.title ?? '');
	// svelte-ignore state_referenced_locally
	let carrierName = $state(form?.carrierName ?? '');
	// svelte-ignore state_referenced_locally
	let type = $state(form?.type ?? 'song');
	// svelte-ignore state_referenced_locally
	let subtype = $state(form?.subtype ?? '');
	// svelte-ignore state_referenced_locally
	let location = $state(form?.location ?? '');
	// svelte-ignore state_referenced_locally
	let dateRecorded = $state(form?.dateRecorded ?? new Date().toISOString().slice(0, 10));
	// svelte-ignore state_referenced_locally
	let body = $state(form?.body ?? '');
	let fileName = $state('');
	let uploading = $state(false);
	let draftRestored = $state(false);
	// Сохранять черновик можно только после восстановления — иначе пустая
	// форма затрёт то, что человек набрал до обрыва связи.
	let restored = $state(false);

	onMount(() => {
		try {
			const saved = localStorage.getItem(DRAFT_KEY);
			if (saved && !title && !carrierName && !body) {
				const draft = JSON.parse(saved);
				if (draft.title || draft.carrierName || draft.body) {
					title = draft.title ?? '';
					carrierName = draft.carrierName ?? '';
					type = draft.type ?? 'song';
					subtype = draft.subtype ?? '';
					body = draft.body ?? '';
					draftRestored = true;
				}
				location = location || draft.location || '';
			}
			// Записи обычно делают подряд в одном месте — не заставляем набирать заново
			location = location || localStorage.getItem(LAST_LOCATION_KEY) || '';
		} catch {
			// приватный режим или запрет хранилища — форма работает и без него
		}
		restored = true;
	});

	// Связь может оборваться посреди загрузки — введённое не должно пропасть.
	$effect(() => {
		const draft = { title, carrierName, type, subtype, location, dateRecorded, body };
		if (!restored) return;
		try {
			localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
		} catch {
			// переполнение хранилища — не повод ломать форму
		}
	});

	let availableSubtypes = $derived(subtypesOf(type));

	// Сменили тип — прежний подраздел к нему уже не относится
	$effect(() => {
		if (subtype && !availableSubtypes.includes(subtype)) subtype = '';
	});

	function onFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		fileName = input.files?.[0]?.name ?? '';
	}
</script>

<svelte:head><title>{$t('archive.add')} — {$t('site.name')}</title></svelte:head>

<p><a class="btn--link" href="/archive">← {$t('archive.title')}</a></p>
<h1>{$t('archive.add')}</h1>

{#if !data.canWrite}
	<LoginRequired />
{:else}
	{#if draftRestored}
		<p class="notice">{$t('archive.draftRestored')}</p>
	{/if}

	{#if form?.missingFields}
		<p class="notice notice--error">{$t('archive.needFields')}</p>
	{:else if form?.badSubtype}
		<p class="notice notice--error">{$t('archive.badSubtype')}</p>
	{:else if form?.needContent}
		<p class="notice notice--error">{$t('archive.needContent')}</p>
	{:else if form?.tooLarge}
		<p class="notice notice--error">{$t('archive.tooLarge')}</p>
	{:else if form?.badFileType}
		<p class="notice notice--error">{$t('archive.badFileType')}</p>
	{:else if form?.uploadFailed || form?.saveFailed}
		<p class="notice notice--error">{$t('common.error')}. {$t('common.tryAgain')}</p>
	{/if}

	<form
		method="POST"
		enctype="multipart/form-data"
		use:enhance={async ({ formData }) => {
			uploading = true;
			const file = formData.get('file');
			if (file instanceof File && file.size > 0 && file.type.startsWith('image/')) {
				formData.set('file', await compressImage(file));
			}
			return async ({ result, update }) => {
				uploading = false;
				if (result.type === 'redirect') {
					try {
						localStorage.removeItem(DRAFT_KEY);
						localStorage.setItem(LAST_LOCATION_KEY, location);
					} catch {
						// не критично
					}
				}
				await update({ reset: false });
			};
		}}
	>
		<div class="field">
			<label for="title">{$t('archive.titleField')} <span class="required">{$t('common.required')}</span></label>
			<input id="title" name="title" type="text" required bind:value={title} placeholder={$t('archive.titlePlaceholder')} />
		</div>

		<div class="field">
			<label for="carrier_name">
				{$t('archive.carrier')} <span class="required">{$t('common.required')}</span>
			</label>
			<p class="field-hint">{$t('archive.carrierHint')}</p>
			<input
				id="carrier_name"
				name="carrier_name"
				type="text"
				required
				bind:value={carrierName}
				placeholder={$t('archive.carrierPlaceholder')}
			/>
		</div>

		<div class="field">
			<label for="type">{$t('archive.type')}</label>
			<select id="type" name="type" bind:value={type}>
				{#each HERITAGE_TYPES as value (value)}
					<option {value}>{$t(`heritage.${value}`)}</option>
				{/each}
			</select>
		</div>

		<!-- Подраздел есть не у каждого типа: у устной истории его нет,
		     и лишнее пустое поле в форме только мешает -->
		{#if availableSubtypes.length > 0}
			<div class="field">
				<label for="subtype">{$t('archive.subtype')}</label>
				<select id="subtype" name="subtype" bind:value={subtype}>
					<option value="">{$t('archive.subtypeNotSet')}</option>
					{#each availableSubtypes as value (value)}
						<option {value}>{$t(`subtype.${value}`)}</option>
					{/each}
				</select>
			</div>
		{/if}

		<div class="field">
			<label for="file">{$t('archive.material')}</label>
			<p class="field-hint">{$t('archive.chooseFile')}</p>
			<input id="file" name="file" type="file" accept="audio/*,video/*,image/*" onchange={onFileChange} />
			{#if fileName}
				<p class="field-hint">{$t('archive.fileChosen')}: {fileName}</p>
			{/if}
		</div>

		<div class="field">
			<label for="body">{$t('archive.orText')}</label>
			<textarea id="body" name="body" bind:value={body} placeholder={$t('archive.textPlaceholder')}></textarea>
		</div>

		<div class="field">
			<label for="location">{$t('archive.location')}</label>
			<input
				id="location"
				name="location"
				type="text"
				bind:value={location}
				placeholder={$t('archive.locationPlaceholder')}
			/>
		</div>

		<div class="field">
			<label for="date_recorded">{$t('archive.date')}</label>
			<input id="date_recorded" name="date_recorded" type="date" bind:value={dateRecorded} />
		</div>

		<button class="btn btn--primary btn--wide" type="submit" disabled={uploading}>
			{uploading ? $t('archive.uploading') : $t('common.save')}
		</button>
	</form>
{/if}
