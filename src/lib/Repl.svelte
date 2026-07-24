<script lang="ts">
	import { copyToClipboard } from '$lib/utils.js';
	import { getHighlighterSingleton } from '$lib/shiki.js';
	import { createTheme } from 'lapikit/actions';
	import type { FileItem, ReplProps } from '$lib/types.js';

	// components
	import Toolbar from '$lib/Toolbar.svelte';
	import Files from '$lib/Files.svelte';

	let { title, content, children, presentation }: ReplProps = $props();

	// refs
	let ref: null | HTMLElement = $state(null);

	// states
	let language = $state('sh');

	let modeState: 'code' | 'playground' | 'mixed' = $state('code');
	let copyState = $state(false);
	let viewState: 'code' | 'preview' = $state('code');

	// theme: mirrors the ambient lapikit theme (light/dark/system) until the
	// toolbar toggle is used, at which point it becomes a local override
	// scoped to this repl instance only.
	const theme = createTheme();
	let themeOverridden = $state(false);
	let themeState = $derived<'light' | 'dark'>(theme.active === 'dark' ? 'dark' : 'light');

	function toggleTheme() {
		themeOverridden = true;
		theme.set(themeState === 'dark' ? 'light' : 'dark');
	}

	let codeHTML = $state<string | null>(null);
	let activeFileIndex = $state(0);

	let files = $derived.by<FileItem[]>(() => {
		if (typeof content === 'object' && content !== null && 'code' in content) {
			return [
				{
					name: title || 'code',
					content: content.code,
					lang: content.lang || 'sh'
				}
			];
		}

		if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
			return Object.entries(content).map(([name, fileContent]) => ({
				name,
				content:
					typeof fileContent === 'string'
						? fileContent
						: (fileContent as Record<string, unknown>).code || '',
				lang:
					typeof fileContent === 'object'
						? ((fileContent as Record<string, unknown>).lang as string)
						: 'sh'
			}));
		}

		if (Array.isArray(content)) {
			return content.map((item) => ({
				name: item.name,
				content: item.content || item.code || '',
				lang: item.lang || 'sh'
			}));
		}

		return [{ name: 'code', content: content || '', lang: 'sh' }];
	});
	let activeFile = $derived(files[activeFileIndex]);

	$effect.pre(() => {
		if (children && content && !presentation) {
			modeState = 'mixed';
			viewState = 'preview';
		} else if (presentation) {
			modeState = 'mixed';
			viewState = 'code';
		} else if (children && !content) {
			modeState = 'playground';
			viewState = 'preview';
		} else {
			modeState = 'code';
			viewState = 'code';
		}
	});

	$effect(() => {
		if (copyState) {
			if (ref?.textContent) {
				copyToClipboard(ref?.textContent);
				copyState = true;

				setTimeout(() => {
					copyState = false;
				}, 1500);
			}
		}
	});

	$effect(() => {
		const file = activeFile;

		if (file?.content) {
			codeHTML = null;
			language = file.lang || 'sh';

			(async () => {
				const highlighter = await getHighlighterSingleton();
				const html = highlighter.codeToHtml(file.content, {
					themes: { light: 'github-light', dark: 'github-dark' },
					defaultColor: false,
					lang: file.lang || language
				});
				codeHTML = html;
			})();
		}
	});
</script>

<div class="kit-repl" use:theme.action={{ overridden: themeOverridden }}>
	{#if presentation}
		<div class="kit-repl-content" class:kit-repl-content--playground={presentation}>
			<div class="wrapper-playground">
				{@render children?.()}
			</div>
		</div>
	{/if}

	<div class="kit-repl-container">
		<Toolbar
			{title}
			{language}
			{presentation}
			{files}
			{themeState}
			onToggleTheme={toggleTheme}
			bind:copyState
			bind:viewState
			bind:modeState
		>
			<Files {files} bind:activeIndex={activeFileIndex} {modeState} {viewState} />
		</Toolbar>

		{#if modeState !== 'code'}
			<hr />
		{/if}

		{#if title}
			<Files {files} bind:activeIndex={activeFileIndex} {modeState} {viewState} />
		{/if}

		<div
			class="kit-repl-content"
			class:kit-repl-content--code={viewState === 'code' && !presentation}
		>
			{#if viewState === 'code'}
				<div class="kit-repl-wrapper-highlight" bind:this={ref}>
					{#if codeHTML !== null}
						<!-- eslint-disable-next-line svelte/no-at-html-tags -->
						{@html codeHTML}
					{:else}
						<pre class="kit-repl-raw"><code>{activeFile?.content ?? ''}</code></pre>
					{/if}
				</div>
			{:else}
				<div class="kit-repl-wrapper-playground">
					{@render children?.()}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.kit-repl {
		/* ui */
		--kit-repl-spacing: var(--kit-space-default, 4px);
		--kit-repl-radius: var(--kit-shape-md, 10px);

		/* shiki override */
		--kit-repl-shiki-size: var(--kit-font-xs, 13px);
		--kit-repl-shiki-tab-size: 2;

		/* colors */
		--kit-repl-background: var(--kit-color-surface-1, #f9f9f9);
		--kit-repl-border-color: var(--kit-color-fill, #ebebeb);
		--kit-repl-primary: var(--kit-color-text, #0d0d34);
		--kit-repl-secondary: var(--kit-color-text-muted, #8f8f8f);
	}
	.kit-repl-container {
		background-color: var(--kit-repl-background);
		border-radius: var(--kit-repl-radius);
		border: 1px solid var(--kit-repl-border-color);
	}

	.kit-repl-container :global(pre) {
		background-color: var(--kit-repl-background) !important;
		border: 0 !important;
		border-radius: 0 !important;
		border-bottom-left-radius: var(--kit-repl-radius) !important;
		border-bottom-right-radius: var(--kit-repl-radius) !important;
		padding: 10px 0 !important;
		margin-bottom: 0 !important;
		margin-top: 0 !important;
		font-size: var(--kit-repl-shiki-size) !important;
	}

	.kit-repl-content {
		display: flow-root;
		padding-left: calc(var(--kit-repl-spacing) * 2);
		/* margin-top: calc(var(--kit-repl-spacing) * 0); */
		/* padding-right: calc(10 * var(--kit-repl-spacing));
		padding-left: calc(5 * var(--kit-repl-spacing));
		padding-bottom: calc(4 * var(--kit-repl-spacing));
		padding-top: calc(3 * var(--kit-repl-spacing)); */
		position: relative;
	}

	.kit-repl-content--code {
		padding-top: 0;
	}

	.kit-repl-content--playground {
		padding-top: calc(4 * var(--kit-repl-spacing));
		padding-bottom: calc(10 * var(--kit-repl-spacing));
	}

	hr {
		max-width: calc(100% - 2.5rem);
		margin-inline-start: calc(2.5rem / 2);
		display: block;
		border: thin solid var(--kit-repl-border-color);
		margin-top: 0;
		margin-bottom: 0;
	}

	.kit-repl-raw {
		font-size: var(--kit-repl-shiki-size);
		-moz-tab-size: var(--kit-repl-shiki-tab-size);
		tab-size: var(--kit-repl-shiki-tab-size);
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
		padding: 0;
	}

	div.kit-repl-container .kit-repl-wrapper-highlight :global(pre code) {
		font-size: var(--kit-repl-shiki-size);
		-moz-tab-size: var(--kit-repl-shiki-tab-size);
		tab-size: var(--kit-repl-shiki-tab-size);
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* shiki dual-theme: follows the ambient lapikit theme (light/dark/system) */
	.kit-repl-wrapper-highlight :global(.shiki),
	.kit-repl-wrapper-highlight :global(.shiki span) {
		color: var(--shiki-light);
	}

	:global([data-kit-theme='dark']) .kit-repl-wrapper-highlight :global(.shiki),
	:global([data-kit-theme='dark']) .kit-repl-wrapper-highlight :global(.shiki span) {
		color: var(--shiki-dark);
	}

	@media (prefers-color-scheme: dark) {
		:global([data-kit-theme='system']) .kit-repl-wrapper-highlight :global(.shiki),
		:global([data-kit-theme='system']) .kit-repl-wrapper-highlight :global(.shiki span) {
			color: var(--shiki-dark);
		}
	}

	div.kit-repl-container .kit-repl-wrapper-playground {
		background-color: var(--kit-repl-background);
		border-radius: var(--kit-repl-radius);
		padding: calc(4 * var(--kit-repl-spacing));
	}
</style>
