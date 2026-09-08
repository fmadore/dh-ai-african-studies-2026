import { expect, it } from 'vitest';
import { createMarkdownIt } from '$lib/reader/markdown';

it('opens external project and note links in new tabs without changing internal navigation', () => {
	const html = createMarkdownIt([]).render(
		'[Project](https://almedaresearch.org/) [section](#intro) [site](https://fmadore.github.io/dh-ai-african-studies-2026/participants) [relative](/position-paper) [email](mailto:example@example.org)\n\nNote[^1]\n\n[^1]: https://example.org/'
	);
	expect(html).toContain(
		'href="https://almedaresearch.org/" target="_blank" rel="noopener noreferrer"'
	);
	expect(html).toContain('href="https://example.org/" target="_blank" rel="noopener noreferrer"');
	expect(html.match(/target="_blank"/g)).toHaveLength(2);
	expect(html).toContain('href="#intro">');
	expect(html).toContain('href="#fn1"');
});
