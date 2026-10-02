import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { prerenderedMainText } from './helpers/prerendered-text.mjs';

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
	const text = prerenderedMainText(await readFile(`build/${route}.html`, 'utf8'));
	for (const phrase of expected) {
		assert.ok(text.includes(phrase), `${route}: missing prerendered content: ${phrase}`);
	}
}
console.log('Programme, directory and paper content are present before hydration.');
