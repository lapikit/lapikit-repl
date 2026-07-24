<script lang="ts">
	import type { ToolbarProps } from '$lib/types.js';
	import Button from '$lib/Button.svelte';
	import { dictionary } from '$lib/utils.js';
	import { Copy, Check, Code, Codesandbox, Moon, Sun } from '@lucide/svelte';

	let {
		children,
		title,
		language,
		presentation,
		files,
		copyState = $bindable(),
		viewState = $bindable(),
		themeState,
		onToggleTheme,
		modeState = $bindable()
	}: ToolbarProps = $props();

	let languageKey = $derived(
		Object.entries(dictionary).find(([, values]) => values.includes(language))?.[0] || language
	);
</script>

<div class="kit-repl--toolbar">
	{#if title}
		<div class="kit-repl--toolbar-title" class:kit-repl--toolbar-title--title={title}>
			<span>{title}</span>
		</div>
	{:else if files && files.length > 1}
		<div class="kit-repl--toolbar-files">
			{@render children?.()}
		</div>
	{:else if language}
		<div class="kit-repl--toolbar-title" class:kit-repl--toolbar-title--language={language}>
			<span>{languageKey}</span>
		</div>
	{/if}

	<div class="kit-repl--toolbar-actions">
		{#if (modeState !== 'code' && viewState === 'preview') || presentation}
			<Button
				aria-label={themeState === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
				aria-pressed={themeState === 'dark'}
				onclick={() => onToggleTheme?.()}
			>
				{#if themeState === 'light'}
					<Moon />
				{:else}
					<Sun />
				{/if}
			</Button>
		{/if}

		{#if modeState === 'mixed' && !presentation}
			<Button
				aria-label={viewState === 'code' ? 'Show preview' : 'Show code'}
				aria-pressed={viewState === 'preview'}
				onclick={() => (viewState = viewState === 'code' ? 'preview' : 'code')}
			>
				{#if viewState === 'code'}
					<Code />
				{:else}
					<Codesandbox />
				{/if}
			</Button>
		{/if}

		{#if modeState !== 'playground'}
			<Button
				aria-label={copyState ? 'Code copied' : 'Copy code'}
				onclick={() => (copyState = true)}
			>
				{#if copyState}
					<Check />
				{:else}
					<Copy />
				{/if}
			</Button>
		{/if}
	</div>
</div>

<style>
	.kit-repl--toolbar {
		display: grid;
		align-items: center;
		grid-template-columns: 1fr auto;
		padding-left: calc(var(--kit-repl-spacing) * 2);
		background-color: color-mix(in oklab, var(--kit-repl-background) 95%, black);
		border-top-left-radius: var(--kit-repl-radius);
		border-top-right-radius: var(--kit-repl-radius);
		gap: var(--kit-repl-spacing);
		min-height: 36px;
	}

	.kit-repl--toolbar .kit-repl--toolbar-title {
		display: flex;
		align-items: center;
		gap: calc(var(--kit-repl-spacing) * 2);
		max-width: 80%;
		min-width: 0;
	}

	.kit-repl--toolbar-title--language {
		font-size: var(--kit-repl-shiki-size);
		line-height: 1;
		color: var(--kit-color-text-muted);
	}

	.kit-repl--toolbar-title--title {
		font-size: var(--kit-repl-shiki-size);
		line-height: 1;
		color: var(--kit-color-text-muted);
	}

	.kit-repl--toolbar .kit-repl--toolbar-actions {
		display: flex;
		align-items: center;
		gap: calc(var(--kit-repl-spacing) * 2);
	}

	.kit-repl--toolbar .kit-repl--toolbar-files {
		width: 100%;
		overflow-x: auto;
	}
</style>
