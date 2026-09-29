#!/usr/bin/env node
/**
 * Run a Python 3 script with the platform's usual command: `python` on
 * Windows, `python3` elsewhere (where `python` is often missing or Python 2).
 * Set PYTHON to use a specific interpreter.
 *
 * Usage: node scripts/python.mjs scripts/fetch_references.py [args…]
 */
import { spawnSync } from 'node:child_process';

const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const result = spawnSync(python, process.argv.slice(2), { stdio: 'inherit' });

if (result.error) {
	console.error(
		`Could not run "${python}" (${result.error.message}). Set PYTHON to a Python 3 executable.`
	);
	process.exit(1);
}
process.exit(result.status ?? 1);
