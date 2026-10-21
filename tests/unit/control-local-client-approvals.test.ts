// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {MemoryLocalClientApprovals, PENDING_APPROVALS_MAX} from '@main/control/socket/localClientApprovals.js'

// Who may use the Control API over the local socket, in memory until the
// Devices and apps screen persists it.

describe('MemoryLocalClientApprovals', () => {
	it('keeps a request pending until the user chooses', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('arroxy-mcp')
		expect(approvals.pending()).toEqual([{approvalId, label: 'arroxy-mcp'}])
		expect(approvals.collect(approvalId)).toEqual({status: 'pending'})
	})

	it('issues a client id and secret once after Allow', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('arroxy-mcp')
		expect(approvals.allow(approvalId)).toBe(true)
		const collected = approvals.collect(approvalId)
		if (collected.status !== 'allowed') throw new Error(`expected allowed, got ${collected.status}`)
		expect(collected.clientSecret).toMatch(/^[A-Za-z0-9_-]{43}$/)
		expect(approvals.client(collected.clientId)).toEqual({clientId: collected.clientId, label: 'arroxy-mcp', secret: collected.clientSecret, rules: ['trusted']})
		expect(approvals.label(collected.clientId)).toBe('arroxy-mcp')
		expect(approvals.collect(approvalId)).toEqual({status: 'refused'})
		expect(approvals.pending()).toEqual([])
	})

	it('grants paths.read only when the user allows it', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('Claude Code')
		approvals.allow(approvalId, {pathsRead: true})
		const collected = approvals.collect(approvalId)
		if (collected.status !== 'allowed') throw new Error('expected allowed')
		expect(approvals.client(collected.clientId)?.rules).toEqual(['trusted', 'paths.read'])
	})

	it('refuses a denied, unknown or removed client', () => {
		const approvals = new MemoryLocalClientApprovals()
		const denied = approvals.request('x')
		expect(approvals.deny(denied)).toBe(true)
		expect(approvals.collect(denied)).toEqual({status: 'refused'})
		expect(approvals.collect('nope')).toEqual({status: 'refused'})
		expect(approvals.allow('nope')).toBe(false)
		const allowed = approvals.request('y')
		approvals.allow(allowed)
		const collected = approvals.collect(allowed)
		if (collected.status !== 'allowed') throw new Error('expected allowed')
		expect(approvals.remove(collected.clientId)).toBe(true)
		expect(approvals.client(collected.clientId)).toBeNull()
		expect(approvals.label(collected.clientId)).toBeNull()
	})

	it('drops the oldest pending request past the cap', () => {
		const approvals = new MemoryLocalClientApprovals()
		const first = approvals.request('first')
		for (let i = 0; i < PENDING_APPROVALS_MAX; i++) approvals.request(`n${i}`)
		expect(approvals.pending()).toHaveLength(PENDING_APPROVALS_MAX)
		expect(approvals.collect(first)).toEqual({status: 'refused'})
	})

	it('allows at once when built to auto-allow (E2E runs only)', () => {
		const approvals = new MemoryLocalClientApprovals({autoAllow: true})
		const approvalId = approvals.request('arroxy-mcp')
		expect(approvals.pending()).toEqual([])
		expect(approvals.collect(approvalId).status).toBe('allowed')
	})
})
