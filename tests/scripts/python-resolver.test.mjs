import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolvePython } from '../../scripts/python.mjs';

test('defaults to python3, or python on Windows', () => {
	assert.equal(resolvePython({ env: {}, platform: 'linux' }), 'python3');
	assert.equal(resolvePython({ env: {}, platform: 'win32' }), 'python');
});

test('PYTHON overrides the platform default', () => {
	assert.equal(resolvePython({ env: { PYTHON: '/opt/py' }, platform: 'win32' }), '/opt/py');
});

test('a script-specific variable such as EPUB_PYTHON wins over PYTHON', () => {
	const env = { PYTHON: '/opt/py', EPUB_PYTHON: '/opt/epub-py' };
	assert.equal(resolvePython({ override: 'EPUB_PYTHON', env }), '/opt/epub-py');
	assert.equal(resolvePython({ override: 'EPUB_PYTHON', env: { PYTHON: '/opt/py' } }), '/opt/py');
});
