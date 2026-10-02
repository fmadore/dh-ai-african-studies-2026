import assert from 'node:assert/strict';
import { test } from 'node:test';
import { prerenderedMainText } from '../helpers/prerendered-text.mjs';

test('only main content can satisfy prerendered-content assertions', () => {
	const html = `<html><head><title>Outside title</title></head><body>
		<header>Outside header</header><main>
		<script>window.data = "Serialized participant";</script>
		<style>.missing::before { content: "Styled participant"; }</style>
		<!-- Comment participant -->
		<template><p>Template participant</p></template>
		<noscript>Fallback participant</noscript>
		<div hidden="false">Hidden participant</div>
		<p>Visible participant</p></main><footer>Outside footer</footer>
		</body></html>`;
	assert.equal(prerenderedMainText(html), 'Visible participant');
});

test('parser handles quoted markup and preserves inline words and block boundaries', () => {
	assert.equal(
		prerenderedMainText('<main><p title="x > y">Fran<em>çais</em></p><p>Next<br>line</p></main>'),
		'Français Next line'
	);
});

test('entities are decoded once, including text that resembles another entity or tag', () => {
	assert.equal(
		prerenderedMainText('<main>&amp;#39; &#39; &#x27; &apos; &amp;amp; &lt;script&gt;</main>'),
		"&#39; ' ' ' &amp; <script>"
	);
});

test('missing or duplicate main elements fail instead of matching unrelated content', () => {
	assert.throws(() => prerenderedMainText('<p>Missing main</p>'), /exactly one/);
	assert.throws(() => prerenderedMainText('<main>One</main><main>Two</main>'), /exactly one/);
});
