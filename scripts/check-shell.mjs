#!/usr/bin/env node
// Syntax-gate the shell scripts users execute directly.
//
// scripts/install.sh is a public entry point — the README tells Linux users to
// pipe it into `sh` — so a syntax error there breaks every new install the
// moment it lands on main. Nothing else in `bun run check` looks at shell.
//
// `dash` is the strict POSIX check: install.sh is piped into `sh`, which is
// dash on Debian/Ubuntu, so a bashism that bash tolerates would still break the
// people the script exists for. It is checked only when present (CI images and
// most dev machines lack it), and bash's own `-n` always runs.
//
// shellcheck is run when available and is advisory-only: it is not installed
// everywhere, and failing the whole gate on a missing optional tool would be
// worse than the warnings it catches.

import {execFileSync} from 'node:child_process'
import {existsSync, readFileSync} from 'node:fs'
import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SCRIPTS = ['scripts/install.sh']

const has = cmd => {
	try {
		// `which` directly, not `command -v` through a shell: passing args with
		// shell:true is deprecated in Node and needs no escaping here anyway.
		execFileSync('which', [cmd], {stdio: 'ignore'})
		return true
	} catch {
		return false
	}
}

let failed = false

for (const rel of SCRIPTS) {
	const abs = resolve(ROOT, rel)
	if (!existsSync(abs)) {
		console.error(`[shell] MISSING ${rel}`)
		failed = true
		continue
	}

	for (const sh of ['sh', 'dash']) {
		if (sh === 'dash' && !has('dash')) continue
		try {
			execFileSync(sh, ['-n', abs], {stdio: 'pipe'})
		} catch (error) {
			const detail = error instanceof Error && 'stderr' in error ? String(error.stderr).trim() : String(error)
			console.error(`[shell] ${sh} -n failed for ${rel}:\n${detail}`)
			failed = true
		}
	}

	// The SHA verification is the only thing standing between a user and running
	// an unverified binary they piped into a shell. Assert it is still wired up,
	// so removing it is a deliberate act rather than a silent regression.
	const src = readFileSync(abs, 'utf8')
	for (const needle of ['SHA256SUMS', 'Checksum mismatch']) {
		if (!src.includes(needle)) {
			console.error(`[shell] ${rel} no longer references ${needle} — download verification may have been dropped`)
			failed = true
		}
	}

	if (has('shellcheck')) {
		try {
			execFileSync('shellcheck', ['-s', 'sh', abs], {stdio: 'pipe'})
		} catch (error) {
			const detail = error instanceof Error && 'stdout' in error ? String(error.stdout).trim() : String(error)
			console.warn(`[shell] shellcheck warnings for ${rel} (advisory):\n${detail}`)
		}
	}
}

if (failed) process.exit(1)
console.log(`[shell] OK - ${SCRIPTS.length} script(s) pass sh${has('dash') ? '/dash' : ''} syntax and keep checksum verification.`)
