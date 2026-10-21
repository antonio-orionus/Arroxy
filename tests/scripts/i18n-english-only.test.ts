import {spawnSync} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {canonicalLocaleJson} from '../../scripts/i18n-catalog-core.js'

// A fix or feature PR changes English only (ADR 0017). These run the catalog script against a copy
// of the real catalogs with an English-only edit, the way such a PR leaves them.
const SCRIPT = path.join(process.cwd(), 'scripts/i18n-catalog.ts')
const BUN = process.platform === 'win32' ? 'bun.exe' : 'bun'

let root = ''

function runCatalog(...args: string[]): {status: number | null; output: string} {
	const result = spawnSync(BUN, [SCRIPT, ...args], {cwd: root, encoding: 'utf8'})
	return {status: result.status, output: `${result.stdout}${result.stderr}`}
}

async function readLocale(lang: string): Promise<Record<string, Record<string, unknown>>> {
	return JSON.parse(await fs.readFile(path.join(root, `src/shared/i18n/locales/${lang}.json`), 'utf8')) as Record<string, Record<string, unknown>>
}

async function editEnglish(edit: (en: Record<string, Record<string, unknown>>) => void): Promise<void> {
	const en = await readLocale('en')
	edit(en)
	await fs.writeFile(path.join(root, 'src/shared/i18n/locales/en.json'), canonicalLocaleJson(JSON.stringify(en)))
}

beforeEach(async () => {
	root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-i18n-english-only-'))
	await fs.cp(path.join(process.cwd(), 'src/shared/i18n/locales'), path.join(root, 'src/shared/i18n/locales'), {recursive: true})
	await fs.cp(path.join(process.cwd(), 'i18n'), path.join(root, 'i18n'), {recursive: true})
})

afterEach(async () => {
	await fs.rm(root, {recursive: true, force: true})
})

describe('an English-only change to the app catalog', () => {
	it('passes the per-PR check and fails the release completeness check when it adds a key', async () => {
		await editEnglish(en => {
			en.common = {...en.common, brandNewAction: 'Do the brand new thing'}
		})

		const perPr = runCatalog('check')
		expect(perPr.status, perPr.output).toBe(0)
		expect(perPr.output).toMatch(/entries in \d+ locales wait for the release translation sync/)

		const release = runCatalog('check', '--complete')
		expect(release.status, release.output).toBe(1)
		expect(release.output).toContain('de: missing-entry at common.brandNewAction')
		expect(release.output).toContain('POT is stale')
		expect(release.output).toContain('Run the translation sync')
	}, 30_000)

	it('compiles the locales without the new key, so it falls back to English', async () => {
		await editEnglish(en => {
			en.common = {...en.common, brandNewAction: 'Do the brand new thing'}
		})

		const compile = runCatalog('compile')
		expect(compile.status, compile.output).toBe(0)
		const de = await readLocale('de')
		expect(de.common).not.toHaveProperty('brandNewAction')
		expect(de.common).toHaveProperty('cancel', 'Abbrechen')
		expect(runCatalog('check').status).toBe(0)
	}, 30_000)

	it('warns on a placeholder change under an existing key, and fails it at release', async () => {
		await editEnglish(en => {
			en.status = {...en.status, downloadingBinary: 'Downloading {{binary}}…'}
		})

		const perPr = runCatalog('check')
		expect(perPr.status, perPr.output).toBe(0)
		expect(perPr.output).toContain('de: placeholder-drift at status.downloadingBinary (expected {{binary}}, found {{name}})')

		const release = runCatalog('check', '--complete')
		expect(release.status, release.output).toBe(1)
		expect(release.output).toContain('de: placeholder-drift at status.downloadingBinary')
	}, 30_000)

	it('still fails the per-PR check on a locale file out of canonical form', async () => {
		const enPath = path.join(root, 'src/shared/i18n/locales/en.json')
		await fs.writeFile(enPath, JSON.stringify(await readLocale('en')))

		const perPr = runCatalog('check')
		expect(perPr.status, perPr.output).toBe(1)
		expect(perPr.output).toContain('src/shared/i18n/locales/en.json: keys must be sorted, one per line: run bun run i18n:format')
	}, 30_000)

	it('lists what the release sync has to translate', async () => {
		const newEntries = (output: string): number => Number(/^de\s+(\d+)\s/m.exec(output)?.[1] ?? 0)
		const before = runCatalog('status')
		await editEnglish(en => {
			en.common = {...en.common, brandNewAction: 'Do the brand new thing'}
		})

		const after = runCatalog('status')
		expect(after.status, after.output).toBe(0)
		expect(after.output).toMatch(/^locale\s+new\s+changed\s+untranslated\s+fuzzy\s+removed\s+README$/m)
		expect(newEntries(after.output)).toBe(newEntries(before.output) + 1)
		expect(after.output).toContain('49 of 49 locales have open entries')
	}, 30_000)
})
