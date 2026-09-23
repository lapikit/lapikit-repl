<script lang="ts">
	import type { FileItem, FilesProps } from '$lib/types.js';
	import { dictionaryIcons, dictionaryPkgIcons } from '$lib/utils.js';

	let { files, activeIndex = $bindable(), modeState, viewState }: FilesProps = $props();

	const shellLangs = ['sh', 'bash', 'shell'];

	// package manager logos only apply to shell snippets named after the manager (npm, yarn, bun)
	function getIcon(file: FileItem) {
		if (file.icon) return file.icon;
		if (file.lang && shellLangs.includes(file.lang)) {
			const pkgIcon = dictionaryPkgIcons[file.name.toLowerCase()];
			if (pkgIcon) return pkgIcon;
		}
		return file.lang ? dictionaryIcons[file.lang] : undefined;
	}
</script>

{#if modeState !== 'playground' && viewState === 'code' && files && files.length > 1}
	<div role="tablist" aria-label="Files">
		{#each files as file, index (index)}
			{@const icon = getIcon(file)}
			<button
				type="button"
				role="tab"
				aria-selected={activeIndex === index}
				aria-label="Select {file.name}"
				class:active={activeIndex === index}
				onclick={() => (activeIndex = index)}
			>
				{#if icon}
					<!-- decorative: the file name is rendered right after -->
					<img src={icon} alt="" />
				{/if}
				<span>{file.name}</span>
			</button>
		{/each}
	</div>
{/if}

<style>
	div {
		display: flex;
		overflow-x: auto;
	}

	button {
		display: flex;
		align-items: center;
		padding: 9px 4px;
		gap: var(--kit-repl-spacing);
		font-size: var(--kit-repl-shiki-size);
		transition: all 0.2s ease;
		border: 0;
		white-space: nowrap;
		background-color: transparent;
		border-bottom: 2px solid transparent;
		cursor: pointer;
	}

	button img {
		width: 16px;
		height: 16px;
		border: 0;
	}

	button:hover {
		border-color: var(--kit-color-accent, var(--kit-repl-secondary));
	}

	button.active {
		border-color: var(--kit-color-accent, var(--kit-repl-primary));
		color: var(--kit-color-accent, var(--kit-repl-primary));
	}
</style>
