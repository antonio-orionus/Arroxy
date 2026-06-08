#!/usr/bin/env node
// Fail if any dependency version uses a semver range (^ ~ >= > ||) instead of
// an exact pin. Protects the supply-chain posture set in bunfig.toml.
//
// Allowed: exact ("1.2.3", "1.2.3-beta.4"), workspace, file:, link:, git URLs.
// Disallowed: "^1.0.0", "~1.0.0", ">=1.0.0", "1.x", "*", "latest", bare majors.

import {readFileSync} from 'node:fs'

const PKG_PATH = 'package.json'
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'))

const SECTIONS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']

// Anything starting with these is a non-registry spec we don't pin.
const PROTOCOL_PREFIXES = ['workspace:', 'file:', 'link:', 'portal:', 'npm:', 'git+', 'git:', 'github:', 'http:', 'https:']

// Exact semver: digits.digits.digits with optional -pre.N or +meta.
const EXACT_SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/

const offenders = []

for (const section of SECTIONS) {
	const deps = pkg[section]
	if (!deps) continue
	for (const [name, range] of Object.entries(deps)) {
		if (typeof range !== 'string') continue
		if (PROTOCOL_PREFIXES.some(p => range.startsWith(p))) continue
		if (EXACT_SEMVER.test(range)) continue
		offenders.push({section, name, range})
	}
}

if (offenders.length === 0) {
	console.log(`[check:pins] OK — all dependencies exact-pinned`)
	process.exit(0)
}

console.error(`[check:pins] FAIL — ${offenders.length} dependency/ies use ranges:`)
for (const {section, name, range} of offenders) {
	console.error(`  ${section}\t${name}\t${range}`)
}
console.error(`\nReplace with exact versions (look up resolved version in bun.lock).` + `\nSupply-chain posture requires exact pins — see bunfig.toml.`)
process.exit(1)
