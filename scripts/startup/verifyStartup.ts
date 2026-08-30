import {execFileSync} from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {checkVerdicts} from './checkVerdicts.js'
import {generateInheritedProfile, previousStableTag} from './fetchPreviousRelease.js'
import {journeysForTier, type StartupTier} from './journeys.js'
import {copyProfilePreservingMtime} from './provisionProfile.js'
import {runJourney, type JourneyVerdict, type RunContext} from './runJourney.js'

function arg(name: string): string | undefined {
	const index = process.argv.indexOf(`--${name}`)
	return index >= 0 ? process.argv[index + 1] : undefined
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

async function main(): Promise<void> {
	const tier = (arg('tier') ?? 'pr') as StartupTier
	const packagedExe = process.env.PACKAGED_EXE ?? arg('exe')
	if (!packagedExe) throw new Error('verify-startup: PACKAGED_EXE or --exe is required')

	const baseDir = fs.mkdtempSync(path.join(process.env.ARROXY_COLD_TMPDIR ?? os.tmpdir(), 'arroxy-startup-'))
	const archive = process.env.ARROXY_LOG_ARCHIVE
	if (archive) fs.mkdirSync(archive, {recursive: true})

	const journeys = journeysForTier(tier)
	if (journeys.length === 0) throw new Error(`verify-startup: tier "${tier}" selected no journeys`)

	// The warm journeys need a populated cache, so they are seeded from the first
	// journey that actually reached the main screen. Journeys are therefore run in
	// catalog order, with `fresh-cold` ahead of `warm-restart`.
	const warmSource = path.join(baseDir, 'warm-source')

	let inheritedSource = process.env.ARROXY_INHERITED_PROFILE
	if (!inheritedSource && journeys.some(journey => journey.profile === 'inherited')) {
		const tags = execFileSync('git', ['tag', '--list', 'v*'], {encoding: 'utf8'}).split('\n').filter(Boolean)
		const previous = previousStableTag(tags, process.env.GITHUB_REF_NAME ?? `v${process.env.npm_package_version ?? ''}`)
		if (!previous) throw new Error('verify-startup: no previous stable release found for the inherited journey')
		console.log(`\n=== generating inherited profile from ${previous}`)
		inheritedSource = await generateInheritedProfile(previous, path.join(baseDir, 'previous'))
	}

	const ctx: RunContext = {packagedExe, baseDir, inheritedSource, fakeToolsDir: writeFakeTools(path.join(baseDir, 'fake tools Ω'))}

	const verdicts: JourneyVerdict[] = []
	for (const journey of journeys) {
		console.log(`\n=== journey: ${journey.id} — ${journey.description}`)

		if (journey.profile === 'warm' && !fs.existsSync(warmSource)) {
			verdicts.push({id: journey.id, outcome: 'fail', observed: 'none', violations: [], error: 'no warm source: no earlier journey reached the main screen', elapsedMs: 0})
			console.log('    FAIL — no warm source available')
			continue
		}

		const verdict = await runJourney(journey, {...ctx, warmSource: fs.existsSync(warmSource) ? warmSource : undefined})
		verdicts.push(verdict)
		console.log(`    ${verdict.outcome.toUpperCase()} observed=${verdict.observed} ${verdict.elapsedMs}ms${verdict.error ? ` — ${verdict.error}` : ''}`)
		for (const violation of verdict.violations) console.log(`    log violation — ${violation.kind}: ${violation.detail}`)

		// Seed the warm cache from the first journey that genuinely warmed one.
		if (verdict.outcome === 'pass' && verdict.observed === 'main-screen' && verdict.profileDir && !fs.existsSync(warmSource)) {
			copyProfilePreservingMtime(verdict.profileDir, warmSource)
		}
	}

	if (archive) fs.writeFileSync(path.join(archive, `verdicts-${tier}.json`), JSON.stringify(verdicts, null, 2))

	const reasons = checkVerdicts(
		journeys.map(journey => journey.id),
		verdicts
	)
	if (reasons.length > 0) {
		console.error(`\nStartup verification FAILED (${reasons.length}):`)
		for (const reason of reasons) console.error(`  - ${reason}`)
		process.exitCode = 1
		return
	}
	console.log(`\nStartup verification passed — ${verdicts.length}/${journeys.length} journeys.`)
}

await main()
