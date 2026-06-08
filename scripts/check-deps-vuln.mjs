#!/usr/bin/env node
// Vulnerability gate. Runs `bun audit --json`, fails on advisories at or above
// THRESHOLD severity. Default threshold: "high". Lower with `--threshold moderate`.

import {spawnSync} from 'node:child_process'

const SEVERITY_RANK = {info: 0, low: 1, moderate: 2, high: 3, critical: 4}
const args = process.argv.slice(2)
const tIdx = args.indexOf('--threshold')
const threshold = tIdx >= 0 ? args[tIdx + 1] : 'high'
const minRank = SEVERITY_RANK[threshold]

if (minRank === undefined) {
	console.error(`bad --threshold: ${threshold}. valid: info|low|moderate|high|critical`)
	process.exit(2)
}

const result = spawnSync('bun', ['audit', '--json'], {encoding: 'utf8'})
const stdout = result.stdout ?? ''
const jsonStart = stdout.indexOf('{')
if (jsonStart < 0) {
	// No advisories — bun prints a plain "0 vulnerabilities" line and exits 0.
	console.log(`[deps:vuln] OK — no advisories`)
	process.exit(0)
}

let advisories
try {
	advisories = JSON.parse(stdout.slice(jsonStart))
} catch (err) {
	console.error(`[deps:vuln] failed to parse bun audit output: ${err.message}`)
	console.error(stdout)
	process.exit(2)
}

const offenders = []
for (const [pkg, list] of Object.entries(advisories)) {
	for (const adv of list) {
		if ((SEVERITY_RANK[adv.severity] ?? 0) >= minRank) {
			offenders.push({pkg, ...adv})
		}
	}
}

if (offenders.length === 0) {
	console.log(`[deps:vuln] OK — no advisories at "${threshold}" or higher`)
	process.exit(0)
}

console.error(`[deps:vuln] FAIL — ${offenders.length} advisor(y/ies) at "${threshold}" or higher:`)
for (const o of offenders) {
	console.error(`  [${o.severity}]\t${o.pkg}\t${o.title}\n\t\t${o.url}`)
}
console.error(`\nFix: bump or replace the vulnerable package, then re-run.`)
process.exit(1)
