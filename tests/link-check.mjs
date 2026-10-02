import { spawn } from 'node:child_process';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { LinkChecker, LinkState } from 'linkinator';

const host = '127.0.0.1';
const port = 4174;
const origin = `http://${host}:${port}`;
const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
const baseUrl = `${origin}${basePath}/`;
const vite = path.resolve('node_modules/vite/bin/vite.js');
const server = spawn(
	process.execPath,
	[vite, 'preview', '--host', host, '--port', String(port), '--strictPort'],
	{
		stdio: 'inherit'
	}
);

async function waitForServer() {
	let lastError;
	for (let attempt = 0; attempt < 40; attempt += 1) {
		try {
			const response = await fetch(baseUrl);
			if (response.ok) return;
			lastError = new Error(`Preview server returned ${response.status}`);
		} catch (error) {
			lastError = error;
		}
		await delay(250);
	}
	throw lastError ?? new Error('Preview server did not start');
}

try {
	await waitForServer();
	const checker = new LinkChecker();
	const result = await checker.check({
		path: baseUrl,
		recurse: true,
		checkCss: true,
		checkFragments: true,
		// Check accidental root-relative links too: excluding them would hide
		// precisely the regressions a GitHub Pages prefix check must detect.
		linksToSkip: async (url) => new URL(url).origin !== origin,
		timeout: 10_000
	});
	const broken = result.links.filter((link) => link.state === LinkState.BROKEN);

	if (broken.length) {
		console.error('Broken generated-site links:');
		for (const link of broken) {
			console.error(`- ${link.url}${link.parent ? ` (from ${link.parent})` : ''}`);
		}
		process.exitCode = 1;
	} else {
		console.log(`Checked ${result.links.length} generated-site links.`);
	}
} finally {
	server.kill();
}
