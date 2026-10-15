// Golden test for the public `code` API. Any change here is a breaking
// change for consumers who key i18n strings or analytics labels off the
// code — must roll a major SemVer bump and update this golden file.

import {describe, expect, it} from 'vite-plus/test'
import {readFileSync} from 'node:fs'
import {join, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'
import {ERROR_KIND_METADATA, YT_DLP_ERROR_KINDS} from '../src/index.js'

const GOLDEN_FILE = join(dirname(fileURLToPath(import.meta.url)), '__golden__', 'codes.json')

interface Golden {
	codes: Record<string, string>
}

describe('error kind codes — golden contract', () => {
	const golden = JSON.parse(readFileSync(GOLDEN_FILE, 'utf8')) as Golden

	it('every code in the golden file matches the live metadata', () => {
		for (const [kind, expected] of Object.entries(golden.codes)) {
			expect(ERROR_KIND_METADATA[kind as keyof typeof ERROR_KIND_METADATA]?.code).toBe(expected)
		}
	})

	it('every kind in the enum has a golden code entry', () => {
		for (const kind of YT_DLP_ERROR_KINDS) {
			expect(golden.codes[kind], `kind "${kind}" missing from golden file`).toBeDefined()
		}
	})

	it('golden file has no orphan codes', () => {
		for (const kind of Object.keys(golden.codes)) {
			expect(YT_DLP_ERROR_KINDS, `orphan kind "${kind}" in golden file`).toContain(kind)
		}
	})
})
