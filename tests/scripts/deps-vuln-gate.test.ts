import {describe, expect, it} from 'vitest'
import {acceptedAdvisoriesSchema, advisoryId, auditReportSchema, evaluateAudit, type AcceptedAdvisory, type AuditReport} from '../../scripts/depsVuln.js'

function advisory(ghsa: string, severity: 'low' | 'moderate' | 'high' | 'critical', title = `title ${ghsa}`): AuditReport[string][number] {
	return {id: 1, url: `https://github.com/advisories/${ghsa}`, title, severity, vulnerable_versions: '<1.0.0'}
}

const TODAY = '2026-10-08'

describe('advisoryId', () => {
	it('reads the GHSA id out of the advisory URL', () => {
		expect(advisoryId(advisory('GHSA-aaaa-bbbb-cccc', 'high'))).toBe('GHSA-aaaa-bbbb-cccc')
	})

	it('falls back to the whole URL for non-GitHub advisories', () => {
		expect(advisoryId({...advisory('x', 'high'), url: 'https://example.com/a/1'})).toBe('https://example.com/a/1')
	})
})

describe('evaluateAudit', () => {
	it('blocks on production advisories at or above the threshold', () => {
		const prod: AuditReport = {shipped: [advisory('GHSA-1111-1111-1111', 'high'), advisory('GHSA-2222-2222-2222', 'moderate')]}

		const result = evaluateAudit({prod, all: prod, threshold: 'high', accepted: [], today: TODAY})

		expect(result.blocking.map(item => item.id)).toEqual(['GHSA-1111-1111-1111'])
	})

	it('reports dev-only advisories without blocking', () => {
		const prod: AuditReport = {}
		const all: AuditReport = {tool: [advisory('GHSA-3333-3333-3333', 'critical')]}

		const result = evaluateAudit({prod, all, threshold: 'high', accepted: [], today: TODAY})

		expect(result.blocking).toEqual([])
		expect(result.devOnly.map(item => [item.pkg, item.id])).toEqual([['tool', 'GHSA-3333-3333-3333']])
	})

	it('does not list a production advisory as dev-only', () => {
		const shared: AuditReport = {both: [advisory('GHSA-4444-4444-4444', 'high')]}

		const result = evaluateAudit({prod: shared, all: shared, threshold: 'high', accepted: [], today: TODAY})

		expect(result.devOnly).toEqual([])
	})

	it('treats the same advisory id in a different package as different', () => {
		const prod: AuditReport = {a: [advisory('GHSA-5555-5555-5555', 'high')]}
		const all: AuditReport = {a: [advisory('GHSA-5555-5555-5555', 'high')], b: [advisory('GHSA-5555-5555-5555', 'high')]}

		const result = evaluateAudit({prod, all, threshold: 'high', accepted: [], today: TODAY})

		expect(result.devOnly.map(item => item.pkg)).toEqual(['b'])
	})

	describe('accepted advisories', () => {
		const accepted: AcceptedAdvisory = {id: 'GHSA-6666-6666-6666', package: 'cache', reason: 'HTTP cache is never enabled', expires: '2026-10-18'}
		const prod: AuditReport = {cache: [advisory('GHSA-6666-6666-6666', 'high')]}

		it('lets an unexpired, matching acceptance through and lists it', () => {
			const result = evaluateAudit({prod, all: prod, threshold: 'high', accepted: [accepted], today: TODAY})

			expect(result.blocking).toEqual([])
			expect(result.accepted.map(item => item.id)).toEqual(['GHSA-6666-6666-6666'])
		})

		it('blocks again once the acceptance has expired and says so', () => {
			const result = evaluateAudit({prod, all: prod, threshold: 'high', accepted: [accepted], today: '2026-10-19'})

			expect(result.blocking.map(item => item.id)).toEqual(['GHSA-6666-6666-6666'])
			expect(result.expired.map(item => item.id)).toEqual(['GHSA-6666-6666-6666'])
		})

		it('treats the expiry day itself as still accepted', () => {
			const result = evaluateAudit({prod, all: prod, threshold: 'high', accepted: [accepted], today: '2026-10-18'})

			expect(result.blocking).toEqual([])
		})

		it('does not accept the same advisory id under another package', () => {
			const other: AuditReport = {different: [advisory('GHSA-6666-6666-6666', 'high')]}

			const result = evaluateAudit({prod: other, all: other, threshold: 'high', accepted: [accepted], today: TODAY})

			expect(result.blocking.map(item => item.pkg)).toEqual(['different'])
		})

		it('flags an acceptance that no longer matches anything so it gets removed', () => {
			const result = evaluateAudit({prod: {}, all: {}, threshold: 'high', accepted: [accepted], today: TODAY})

			expect(result.blocking).toEqual([])
			expect(result.unused.map(item => item.id)).toEqual(['GHSA-6666-6666-6666'])
		})
	})
})

describe('input parsing', () => {
	it('rejects an audit report with an unknown severity', () => {
		expect(auditReportSchema.safeParse({pkg: [{...advisory('GHSA-7777-7777-7777', 'high'), severity: 'scary'}]}).success).toBe(false)
	})

	it('requires a reason and a valid expiry date on every acceptance', () => {
		expect(acceptedAdvisoriesSchema.safeParse([{id: 'GHSA-8888-8888-8888', package: 'p', reason: '', expires: '2026-10-18'}]).success).toBe(false)
		expect(acceptedAdvisoriesSchema.safeParse([{id: 'GHSA-8888-8888-8888', package: 'p', reason: 'why', expires: 'soon'}]).success).toBe(false)
		expect(acceptedAdvisoriesSchema.safeParse([{id: 'GHSA-8888-8888-8888', package: 'p', reason: 'why', expires: '2026-10-18'}]).success).toBe(true)
	})
})
