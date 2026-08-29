#!/usr/bin/env bun
// Fails when the app locale list and the README locale list drift apart.
//
// SUPPORTED_LANGS (src/shared/schemas.ts) drives the language picker, the
// runtime catalogs, and check:app. LOCALES (readme-src/strings.mjs) drives every
// generated README. Nothing else compares the two, so registering a locale on
// one side only ships an app speaking a language its own README never lists.

import {LOCALES} from '../readme-src/strings.mjs'
import {LANGUAGE_NATIVE_NAMES} from '../src/shared/i18n/types.js'
import {SUPPORTED_LANGS} from '../src/shared/schemas.js'

const appCodes: readonly string[] = SUPPORTED_LANGS
const readmeCodes = LOCALES.map(locale => locale.code)
const problems: string[] = []

for (const code of appCodes) {
	if (!readmeCodes.includes(code)) problems.push(`${code}: in SUPPORTED_LANGS but missing from readme-src/strings.mjs`)
}
for (const code of readmeCodes) {
	if (!appCodes.includes(code)) problems.push(`${code}: in readme-src/strings.mjs but missing from SUPPORTED_LANGS`)
}

// Both lists document the same ordering convention (endonym collation), so a
// mismatch here means one side was appended to instead of inserted in place.
if (!problems.length && appCodes.join(' ') !== readmeCodes.join(' ')) {
	problems.push(`order differs — SUPPORTED_LANGS: ${appCodes.join(' ')} / LOCALES: ${readmeCodes.join(' ')}`)
}

for (const locale of LOCALES) {
	const native = LANGUAGE_NATIVE_NAMES[locale.code as keyof typeof LANGUAGE_NATIVE_NAMES]
	if (native && native !== locale.name) problems.push(`${locale.code}: endonym differs — picker "${native}" vs README "${locale.name}"`)
}

if (problems.length) {
	console.error('FAIL: app and README locale lists are out of sync.')
	for (const problem of problems) console.error(`  ✗ ${problem}`)
	process.exit(1)
}

console.log(`✓ app and README locale lists in sync — ${appCodes.length} languages.`)
