<script lang="ts">
	import { KitApp } from 'lapikit/components';
	import { createGlobalTheme } from 'lapikit/hooks';

	createGlobalTheme();

	let { children } = $props();
</script>

<KitApp>
	<main>
		{@render children()}
	</main>
</KitApp>
