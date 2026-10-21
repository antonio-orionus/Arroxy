// PRs change English only (ADR 0017), so translation completeness is a release
// gate: the release script refuses to tag without it, and the tag workflow
// checks it again before anything is published.

import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function qualityGateRuns(): string[] {
	const doc: unknown = yaml.load(readFileSync('.github/workflows/release.yml', 'utf8'))
	const jobs = isRecord(doc) && isRecord(doc.jobs) ? doc.jobs : {}
	const gate = jobs['quality-gate']
	const steps = isRecord(gate) && Array.isArray(gate.steps) ? gate.steps : []
	return steps.filter(isRecord).flatMap(step => (typeof step.run === 'string' ? [step.run] : []))
}

describe('translation completeness at release', () => {
	it('runs in the release workflow quality gate', () => {
		expect(qualityGateRuns()).toContain('bun run check:i18n:complete')
	})

	it('is checked by the release script before it tags, for stable and beta alike', () => {
		const script = readFileSync('scripts/release.sh', 'utf8')
		const preflight = script.indexOf('check:i18n:complete')
		expect(preflight).toBeGreaterThan(-1)
		expect(preflight).toBeLessThan(script.indexOf('git tag -a'))
		expect(script).toContain('Run the i18n sync first')
	})

	it('stays out of the gate every PR runs', () => {
		const scripts = (JSON.parse(readFileSync('package.json', 'utf8')) as {scripts: Record<string, string>}).scripts
		expect(scripts['check:i18n']).not.toContain('complete')
		expect(scripts.test).not.toContain('i18n-complete')
		expect(scripts['check:i18n:complete']).toContain('--project i18n-complete')
	})
})
