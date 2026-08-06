#!/usr/bin/env node
// Single entry point for the fixture product E2E suite on every platform.
//
// Two different problems get conflated here, so they are resolved separately:
//
//   ARROXY_E2E_HEADLESS  hides the window and stops it stealing focus, but
//                        still needs a display to exist.
//   xvfb-run             provides a display where there is none.
//
// A machine with a real display (macOS, Windows, a Linux desktop) runs hidden
// so a suite run does not take over the screen. A display-less Linux box (CI,
// containers, SSH) runs under xvfb with a normal visible window — deliberately
// not hidden, because ClipboardWatcher only polls while the window is focused
// and visible, and that spec skips itself in headless mode.

import {spawn} from 'node:child_process'
import {existsSync, readdirSync} from 'node:fs'
import path from 'node:path'

// Enumerated rather than passed as a glob: the shell used to expand this before
// Playwright saw it, and Playwright treats positional arguments as regexes, not
// globs — so a literal `fixture-*.spec.ts` matches nothing.
const SPEC_DIR = 'tests/e2e'
const specs = readdirSync(SPEC_DIR)
	.filter(name => /^fixture-.*\.spec\.ts$/.test(name))
	.sort()
	.map(name => path.posix.join(SPEC_DIR, name))

if (specs.length === 0) {
	console.error(`No fixture specs found in ${SPEC_DIR}/`)
	process.exit(1)
}

const PLAYWRIGHT_ARGS = ['playwright', 'test', ...specs, '--config', 'playwright.config.ts', '--workers=1']

function hasDisplay() {
	if (process.platform !== 'linux') return true
	// Truthiness, not nullish: an empty DISPLAY means no display, and `??` would
	// treat the empty string as a usable value.
	return Boolean(process.env.DISPLAY) || Boolean(process.env.WAYLAND_DISPLAY)
}

function hasXvfbRun() {
	// Resolved against PATH directly rather than shelling out to `which`, which
	// would be an extra unlisted binary dependency for a one-line lookup.
	const dirs = (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)
	return dirs.some(dir => existsSync(path.join(dir, 'xvfb-run')))
}

const displayAvailable = hasDisplay()

if (!displayAvailable && !hasXvfbRun()) {
	console.error('No display available and xvfb-run is not installed.\nInstall it (e.g. `sudo apt-get install -y xvfb`) or run with a display attached.')
	process.exit(1)
}

const command = displayAvailable ? 'bunx' : 'xvfb-run'
const args = displayAvailable ? PLAYWRIGHT_ARGS : ['-a', 'bunx', ...PLAYWRIGHT_ARGS]
const env = {...process.env}
if (displayAvailable) env.ARROXY_E2E_HEADLESS = '1'
// Cleared, not merely unset: inheriting ARROXY_E2E_HEADLESS=1 from the caller
// would keep the xvfb run headless, and the clipboard spec skips itself in that
// mode — silently dropping the coverage this branch exists to preserve.
else delete env.ARROXY_E2E_HEADLESS

console.log(displayAvailable ? 'Running fixture E2E with a hidden window (no focus stealing).' : 'Running fixture E2E under xvfb (no display detected).')

const child = spawn(command, args, {stdio: 'inherit', env})
child.on('exit', (code, signal) => process.exit(signal ? 1 : (code ?? 1)))
child.on('error', error => {
	console.error(`Failed to start ${command}: ${error.message}`)
	process.exit(1)
})
