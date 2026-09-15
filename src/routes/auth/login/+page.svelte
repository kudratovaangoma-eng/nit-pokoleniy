<script lang="ts">
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n';

	let { data, form } = $props();
	let sending = $state(false);
</script>

<svelte:head><title>{$t('auth.loginTitle')} — {$t('site.name')}</title></svelte:head>

<h1>{$t('auth.loginTitle')}</h1>

{#if form?.sent}
	<p class="notice notice--ok">{$t('auth.linkSent')}</p>
	<p class="muted">{form.email}</p>
{:else}
	<p class="lead">{$t('auth.loginLead')}</p>

	{#if data.expired}
		<p class="notice notice--error">{$t('auth.linkExpired')}</p>
	{/if}

	{#if form?.invalidEmail}
		<p class="notice notice--error">{$t('auth.email')} — {$t('common.required')}</p>
	{:else if form?.failed}
		<p class="notice notice--error">{$t('common.error')}. {$t('common.tryAgain')}</p>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			sending = true;
			return async ({ update }) => {
				await update();
				sending = false;
			};
		}}
	>
		<input type="hidden" name="next" value={data.next} />

		<div class="field">
			<label for="email">{$t('auth.email')} <span class="required">{$t('common.required')}</span></label>
			<input
				id="email"
				name="email"
				type="email"
				required
				autocomplete="email"
				inputmode="email"
				value={form?.email ?? ''}
			/>
		</div>

		<div class="field">
			<label for="display_name">{$t('auth.name')}</label>
			<p class="field-hint">{$t('auth.nameHint')}</p>
			<input
				id="display_name"
				name="display_name"
				type="text"
				autocomplete="name"
				value={form?.displayName ?? ''}
			/>
		</div>

		<button class="btn btn--primary btn--wide" type="submit" disabled={sending}>
			{sending ? $t('common.loading') : $t('auth.sendLink')}
		</button>
	</form>
{/if}
