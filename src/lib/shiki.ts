import { createHighlighter, type Highlighter } from 'shiki';

let highlighter: Highlighter | null = null;

const highlighterPromise: Promise<Highlighter> = createHighlighter({
	themes: ['github-light', 'github-dark'],
	langs: ['svelte', 'typescript', 'javascript', 'html', 'css', 'json', 'bash']
}).then((h) => {
	highlighter = h;
	return h;
});

export async function getHighlighterSingleton(): Promise<Highlighter> {
	if (highlighter) return highlighter;
	return highlighterPromise;
}
