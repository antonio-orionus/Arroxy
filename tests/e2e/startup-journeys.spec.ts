import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {expect, test} from '@playwright/test'
import {checkVerdicts} from '../../scripts/startup/checkVerdicts.js'
import {generateInheritedProfile, previousStableTag} from '../../scripts/startup/fetchPreviousRelease.js'
import {journeysForTier, STARTUP_TIERS, validateJourneySequence, type StartupTier} from '../../scripts/startup/journeys.js'
import {copyProfilePreservingMtime} from '../../scripts/startup/provisionProfile.js'
import {runJourney, type JourneyVerdict, type RunContext} from '../../scripts/startup/runJourney.js'

// Startup verification harness entry point.
//
// This is a Playwright Test spec rather than a bare CLI script on purpose:
// `_electron.launch()` hangs indefinitely when called from a script executed
// directly by Bun (the CDP attach never completes), while every real Electron
// launch in this repo runs under the Playwright CLI — which `bunx` resolves
// through its `#!/usr/bin/env node` shebang into a real Node process. Keeping
// the harness as a spec puts the launch on that proven path. The journeys stay
// data + modules under `scripts/startup/` (unit-tested), imported from here
// unchanged.
//
// The whole tier runs inside one test because journeys share ordered state:
// each warm journey names the journey whose profile it clones (`profile.from` —
// `fresh-cold` in every shipped tier), so per-test parallelism would break the
// seeding chain.
// Verdict accounting — not Playwright test granularity — is the pass signal:
// `checkVerdicts` below fails unless every declared journey reported.
// The tier arrives as `ARROXY_STARTUP_TIER` (pr | release | nightly) rather
// than a CLI arg so the same spec serves all three workflows.
test.setTimeout(35 * 60 * 1000)

function tierFromEnv(): StartupTier {
	const raw = process.env.ARROXY_STARTUP_TIER ?? 'pr'
	if (!STARTUP_TIERS.includes(raw as StartupTier)) throw new Error(`startup-journeys: ARROXY_STARTUP_TIER="${raw}" is not one of ${STARTUP_TIERS.join(', ')}`)
	return raw as StartupTier
}

function writeFakeTools(dir: string): string {
	fs.mkdirSync(dir, {recursive: true})
	const scripts: Record<string, string> = {node: '#!/usr/bin/env sh\necho "fake old node v10.0.0"\n', deno: '#!/usr/bin/env sh\necho "fake deno 2.0.0"\n', 'yt-dlp': '#!/usr/bin/env sh\necho "fake yt-dlp should not be used" >&2\nexit 1\n'}
	for (const [name, body] of Object.entries(scripts)) {
		const file = path.join(dir, process.platform === 'win32' ? `${name}.cmd` : name)
		fs.writeFileSync(file, process.platform === 'win32' ? '@echo off\r\nexit /b 1\r\n' : body)
		if (process.platform !== 'win32') fs.chmodSync(file, 0o755)
	}
	return dir
}

test('every declared journey reaches its expected end state with clean logs', async () => {
	const tier = tierFromEnv()
	const packagedExe = process.env.PACKAGED_EXE
	if (!packagedExe) throw new Error('startup-journeys: PACKAGED_EXE is required (path to the packaged Arroxy executable)')

	const baseDir = fs.mkdtempSync(path.join(process.env.ARROXY_COLD_TMPDIR ?? os.tmpdir(), 'arroxy-startup-'))
	const archive = process.env.ARROXY_LOG_ARCHIVE
	if (archive) fs.mkdirSync(archive, {recursive: true})

	const journeys = journeysForTier(tier)
	const problems = validateJourneySequence(journeys, tier)
	if (problems.length > 0) throw new Error(`startup-journeys: tier "${tier}" is not runnable:\n  - ${problems.join('\n  - ')}`)

	// Each journey that some warm journey names as its seeder gets its profile
	// snapshotted under its own id. Cloning a fixed `profile-warm` directory in
	// place would not survive two warm journeys in one tier.
	const warmSources = new Map<string, string>()
	const seedIds = new Set(journeys.flatMap(journey => (journey.profile.kind === 'warm' ? [journey.profile.from] : [])))

	let inheritedSource = process.env.ARROXY_INHERITED_PROFILE
	if (!inheritedSource && journeys.some(journey => journey.profile.kind === 'inherited')) {
		const tags = execFileSync('git', ['tag', '--list', 'v*'], {encoding: 'utf8'}).split('\n').filter(Boolean)
		const previous = previousStableTag(tags, process.env.GITHUB_REF_NAME ?? `v${process.env.npm_package_version ?? ''}`)
		if (!previous) throw new Error('startup-journeys: no previous stable release found for the inherited journey')
		console.log(`\n=== generating inherited profile from ${previous}`)
		inheritedSource = await generateInheritedProfile(previous, path.join(baseDir, 'previous'))
	}

	const ctx: RunContext = {packagedExe, baseDir, inheritedSource, fakeToolsDir: writeFakeTools(path.join(baseDir, 'fake tools Ω'))}

	const verdicts: JourneyVerdict[] = []
	for (const journey of journeys) {
		console.log(`\n=== journey: ${journey.id} — ${journey.description}`)

		let warmSource: string | undefined
		if (journey.profile.kind === 'warm') {
			warmSource = warmSources.get(journey.profile.from)
			if (!warmSource) {
				verdicts.push({id: journey.id, outcome: 'fail', observed: 'none', violations: [], error: `no warm source: "${journey.profile.from}" did not reach the main screen`, elapsedMs: 0})
				console.log('    FAIL — no warm source available')
				continue
			}
		}

		const verdict = await runJourney(journey, {...ctx, warmSource})
		verdicts.push(verdict)
		console.log(`    ${verdict.outcome.toUpperCase()} observed=${verdict.observed} ${verdict.elapsedMs}ms${verdict.error ? ` — ${verdict.error}` : ''}`)
		for (const violation of verdict.violations) console.log(`    log violation — ${violation.kind}: ${violation.detail}`)

		// The oracle's violation details truncate multi-line entries, so the verdicts
		// JSON alone cannot triage a red journey — archive the full main.log next to
		// it or the evidence dies with the runner.
		if (archive && verdict.profileDir) {
			const logPath = path.join(verdict.profileDir, 'logs', 'main.log')
			if (fs.existsSync(logPath)) fs.copyFileSync(logPath, path.join(archive, `main-${journey.id}.log`))
		}

		if (verdict.outcome === 'pass' && verdict.observed === 'main-screen' && verdict.profileDir && seedIds.has(journey.id) && !warmSources.has(journey.id)) {
			const snapshot = path.join(baseDir, `warm-${journey.id}`)
			copyProfilePreservingMtime(verdict.profileDir, snapshot)
			warmSources.set(journey.id, snapshot)
		}
	}

	// Written before any assertion, so a failing run still archives full verdicts.
	if (archive) fs.writeFileSync(path.join(archive, `verdicts-${tier}.json`), JSON.stringify(verdicts, null, 2))

	const reasons = checkVerdicts(
		journeys.map(journey => journey.id),
		verdicts
	)
	if (reasons.length > 0) {
		console.error(`\nStartup verification FAILED (${reasons.length}):`)
		for (const reason of reasons) console.error(`  - ${reason}`)
	}
	expect(reasons, reasons.join('\n')).toEqual([])
	console.log(`\nStartup verification passed — ${verdicts.length}/${journeys.length} journeys.`)
})
