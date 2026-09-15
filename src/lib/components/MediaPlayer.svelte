<script lang="ts">
	import { mediaUrl } from '$lib/supabase';
	import { t } from '$lib/i18n';
	import type { MediaKind } from '$lib/types';

	let { kind, path, body, title } = $props<{
		kind: MediaKind;
		path: string | null;
		body: string | null;
		title: string;
	}>();

	let src = $derived(mediaUrl(path));
</script>

{#if kind === 'text'}
	<div class="record-text">{body}</div>
{:else if src && kind === 'audio'}
	<!-- preload="none": на слабом интернете аудио грузится только по нажатию -->
	<audio class="media" controls preload="none" src={src}></audio>
{:else if src && kind === 'video'}
	<!-- Субтитров к полевым записям нет и не будет: их снимают на телефон
	     в кишлаке. Расшифровка появляется отдельной текстовой записью. -->
	<!-- svelte-ignore a11y_media_has_caption -->
	<video class="media" controls preload="none" playsinline src={src}></video>
{:else if src && kind === 'photo'}
	<img class="media" {src} alt={title} loading="lazy" decoding="async" />
{/if}

{#if src && kind !== 'text'}
	<p class="small"><a href={src} download>{$t('archive.openFile')}</a></p>
{/if}

<style>
	.record-text {
		white-space: pre-wrap;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		font-size: 1.05rem;
	}

	audio.media {
		background: var(--accent-soft);
		height: 54px;
	}
</style>
