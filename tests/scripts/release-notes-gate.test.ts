// A stable tag must publish its CHANGELOG.md section. release.sh checks it before
// tagging, but a tag pushed by hand skips the script, so the tag workflow checks
// it again before building, and publishing refuses a stable tag without notes.
// A beta may still fall back to PR titles.

import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function jobSteps(job: string): Record<string, unknown>[] {
	const doc: unknown = yaml.load(readFileSync('.github/workflows/release.yml', 'utf8'))
	const jobs = isRecord(doc) && isRecord(doc.jobs) ? doc.jobs : {}
	const found = jobs[job]
	return isRecord(found) && Array.isArray(found.steps) ? found.steps.filter(isRecord) : []
}

describe('release notes for a stable tag', () => {
	it('are verified in the quality gate, for stable tags only, before anything is built', () => {
		const step = jobSteps('quality-gate').find(candidate => typeof candidate.run === 'string' && candidate.run.includes('changelog.ts verify-release'))
		expect(step).toBeDefined()
		expect(step?.run).toContain('"${GITHUB_REF_NAME#v}"')
		expect(step?.if).toBe("${{ !contains(github.ref_name, '-') }}")
	})

	it('are required by publish-release, which falls back to PR titles only for a beta', () => {
		const run = jobSteps('publish-release')
			.map(step => (typeof step.run === 'string' ? step.run : ''))
			.find(text => text.includes('MANUAL_NOTES'))
		expect(run).toBeDefined()
		const fallback = run?.slice(run.indexOf('else'), run.indexOf('gh release edit')) ?? ''
		expect(fallback).toContain('::error::')
		expect(fallback).toMatch(/\*-\*/)
		expect(fallback).toContain('exit 1')
	})
})
