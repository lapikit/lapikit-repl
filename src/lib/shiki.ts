import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

let highlighterPromise: Promise<HighlighterCore> | null = null;

export function getHighlighterSingleton(): Promise<HighlighterCore> {
	highlighterPromise ??= createHighlighterCore({
		themes: [import('shiki/themes/github-light.mjs'), import('shiki/themes/github-dark.mjs')],
		langs: [
			import('shiki/langs/svelte.mjs'),
			import('shiki/langs/typescript.mjs'),
			import('shiki/langs/javascript.mjs'),
			import('shiki/langs/html.mjs'),
			import('shiki/langs/css.mjs'),
			import('shiki/langs/json.mjs'),
			import('shiki/langs/bash.mjs')
		],
		engine: createJavaScriptRegexEngine()
	}).catch((error) => {
		highlighterPromise = null;
		throw error;
	});

	return highlighterPromise;
}

export function resolveLang(h: HighlighterCore, lang: string): string {
	return h.getLoadedLanguages().includes(lang) ? lang : 'text';
}
