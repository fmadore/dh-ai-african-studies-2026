import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

/** Inspect the HTML delivered before hydration, excluding serialized page data. */
function renderedText(html) {
	return html
		.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#(?:39|x27);|&apos;/gi, "'")
		.replace(/\s+/g, ' ');
}

for (const [route, expected] of [
	['participants', ['Albrecht Hofheinz', 'Frédérick Madore', 'Vincent Hiribarren']],
	[
		'schedule',
		[
			'Registration & Welcome Coffee',
			'Reflection on Day One',
			'Aims of Day 3',
			"What's Next / Conclusion"
		]
	],
	['position-paper/read', ['For Whom and For What Purpose?', 'References']]
]) {
	const text = renderedText(await readFile(`build/${route}.html`, 'utf8'));
	for (const phrase of expected) {
		assert.ok(text.includes(phrase), `${route}: missing prerendered content: ${phrase}`);
	}
}
console.log('Programme, directory and paper content are present before hydration.');
