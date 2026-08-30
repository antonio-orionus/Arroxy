import {describe, expect, it} from 'vitest'
import {inspectStartupLog} from '../../scripts/startup/logOracle.js'

const CLEAN_LOG = `[2026-08-30 05:22:31.753] [info]  Session started
[2026-08-30 05:22:32.066] [info]  (warmup)  Warmup branch settled { branch: 'ffmpeg', elapsedMs: 67 }
[2026-08-30 05:22:52.330] [info]  (warmup)  Warmup branch settled { branch: 'ytDlp', elapsedMs: 20331 }
[2026-08-30 05:22:52.330] [info]  (warmup)  Warmup completed {
  totalMs: 20331,
  gatedBy: 'ytDlp',
  branches: { ytDlp: 20331, ffmpeg: 67 }
}`

const EMPTY_POLICY = {allowedWarnings: []} as const

describe('inspectStartupLog', () => {
	it('accepts a clean startup log', () => {
		expect(inspectStartupLog(CLEAN_LOG, EMPTY_POLICY)).toEqual([])
	})

	it('flags a log with no Warmup completed line', () => {
		const violations = inspectStartupLog('[2026-08-30 05:22:31.753] [info]  Session started', EMPTY_POLICY)
		expect(violations).toHaveLength(1)
		expect(violations[0]?.kind).toBe('missing-warmup-completed')
	})

	it('flags a summary branch that never settled', () => {
		const log = CLEAN_LOG.replace(`[2026-08-30 05:22:32.066] [info]  (warmup)  Warmup branch settled { branch: 'ffmpeg', elapsedMs: 67 }\n`, '')
		const violations = inspectStartupLog(log, EMPTY_POLICY)
		expect(violations).toContainEqual({kind: 'unsettled-branch', detail: 'ffmpeg'})
	})

	it('flags error lines', () => {
		const violations = inspectStartupLog(`${CLEAN_LOG}\n[2026-08-30 05:22:53.000] [error]  Warmup failed hard`, EMPTY_POLICY)
		expect(violations).toContainEqual({kind: 'error-line', detail: 'Warmup failed hard'})
	})

	it('flags warnings not covered by the allowlist', () => {
		const violations = inspectStartupLog(`${CLEAN_LOG}\n[2026-08-30 05:22:53.000] [warn]  Token warmup threw`, EMPTY_POLICY)
		expect(violations).toContainEqual({kind: 'disallowed-warning', detail: 'Token warmup threw'})
	})

	it('honours the allowlist', () => {
		const violations = inspectStartupLog(`${CLEAN_LOG}\n[2026-08-30 05:22:53.000] [warn]  Token warmup threw`, {allowedWarnings: [/Token warmup threw/]})
		expect(violations).toEqual([])
	})
})
