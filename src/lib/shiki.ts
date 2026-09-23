import { createHighlighterCore, type HighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// Fine-grained bundle: only the grammars/themes listed here end up in the
// consumer's build, and the JS regex engine avoids shipping the Oniguruma WASM.
let highlighter: HighlighterCore | null = null;

const highlighterPromise: Promise<HighlighterCore> = createHighlighterCore({
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
}).then((h) => {
	highlighter = h;
	return h;
});

export async function getHighlighterSingleton(): Promise<HighlighterCore> {
	if (highlighter) return highlighter;
	return highlighterPromise;
}

// Unsupported languages render as plain text instead of throwing
export function resolveLang(h: HighlighterCore, lang: string): string {
	return h.getLoadedLanguages().includes(lang) ? lang : 'text';
}
