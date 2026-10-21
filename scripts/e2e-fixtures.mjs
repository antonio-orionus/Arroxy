#!/usr/bin/env node
// Single entry point for the Electron E2E suite that gates CI (every spec
// `scripts/e2eSpecs.mjs` selects: Fixture Product E2E and the Mock Electron
// smoke specs) on every platform. Where the window is drawn (hidden, or under
// xvfb on Linux) is decided in `scripts/e2eDisplay.mjs`.

import {spawn} from 'node:child_process'
import {existsSync, readdirSync} from 'node:fs'
import path from 'node:path'
import {planE2eRun} from './e2eDisplay.mjs'
import {E2E_SPEC_DIR, selectGatingSpecs} from './e2eSpecs.mjs'

// Enumerated rather than passed as a glob: the shell used to expand this before
// Playwright saw it, and Playwright treats positional arguments as regexes, not
// globs — so a literal `*.spec.ts` matches nothing.
const specs = selectGatingSpecs(readdirSync(E2E_SPEC_DIR))

if (specs.length === 0) {
	console.error(`No E2E specs found in ${E2E_SPEC_DIR}/`)
	process.exit(1)
}

// Extra arguments are forwarded so CI can split the suite across runners with
// `--shard=i/n`. Without forwarding, every shard would silently run the whole
// suite.
const PLAYWRIGHT_ARGS = ['playwright', 'test', ...specs, '--config', 'playwright.config.ts', '--workers=1', ...process.argv.slice(2)]

function hasXvfbRun() {
	// Resolved against PATH directly rather than shelling out to `which`, which
	// would be an extra unlisted binary dependency for a one-line lookup.
	const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)
	return dirs.some(dir => existsSync(path.join(dir, 'xvfb-run')))
}

const plan = planE2eRun({platform: process.platform, env: process.env, xvfbRunAvailable: process.platform === 'linux' && hasXvfbRun(), playwrightArgs: PLAYWRIGHT_ARGS})

if (plan.kind === 'error') {
	console.error(plan.message)
	process.exit(1)
}

const {command, args, env} = plan

console.log(`Running ${specs.length} E2E specs ${plan.banner}.`)

const child = spawn(command, args, {stdio: 'inherit', env})
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 1)))
child.on('error', error => {
	console.error(`Failed to start ${command}: ${error.message}`)
	process.exit(1)
})
