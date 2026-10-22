// @vitest-environment node

import {describe, expect, it} from 'vite-plus/test'
import {ALLOWED_APPROVAL_TTL_MS, type ApprovalClaim, type LocalClient, MemoryLocalClientApprovals, PENDING_APPROVALS_MAX} from '@main/control/socket/localClientApprovals.js'

// Who may use the Control API over the local socket, in memory until the
// Devices and apps screen persists it.

function claimed(claim: ApprovalClaim): LocalClient {
	if (claim.status !== 'allowed') throw new Error(`expected allowed, got ${claim.status}`)
	return claim.client
}

describe('MemoryLocalClientApprovals', () => {
	it('keeps a request pending until the user chooses', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('arroxy-mcp')
		expect(approvals.pending()).toEqual([{approvalId, label: 'arroxy-mcp'}])
		expect(approvals.claim(approvalId)).toEqual({status: 'pending'})
	})

	it('issues a client once its answer was delivered', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('arroxy-mcp')
		expect(approvals.allow(approvalId)).toBe(true)
		const client = claimed(approvals.claim(approvalId))
		expect(client).toEqual({clientId: expect.any(String), label: 'arroxy-mcp', secret: expect.stringMatching(/^[A-Za-z0-9_-]{43}$/), rules: ['trusted']})
		// Known while its secret is being written, so a quick reconnect works.
		expect(approvals.client(client.clientId)).toEqual(client)
		approvals.confirm(approvalId)
		expect(approvals.client(client.clientId)).toEqual(client)
		expect(approvals.label(client.clientId)).toBe('arroxy-mcp')
		expect(approvals.claim(approvalId)).toEqual({status: 'refused'})
		expect(approvals.pending()).toEqual([])
	})

	it('holds a claimed approval for one connection, and frees it when the answer is lost', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('arroxy-mcp')
		approvals.allow(approvalId)
		const first = claimed(approvals.claim(approvalId))
		expect(approvals.claim(approvalId)).toEqual({status: 'pending'})
		approvals.release(approvalId)
		expect(approvals.client(first.clientId)).toBeNull()
		expect(claimed(approvals.claim(approvalId))).toEqual(first)
	})

	it('confirms a claimed approval once its secret is proven, so a later release changes nothing', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('arroxy-mcp')
		approvals.allow(approvalId)
		const client = claimed(approvals.claim(approvalId))
		approvals.proven(client.clientId)
		approvals.release(approvalId)
		expect(approvals.client(client.clientId)).toEqual(client)
		expect(approvals.claim(approvalId)).toEqual({status: 'refused'})
		expect(approvals.remove(client.clientId)).toBe(true)
	})

	it('grants paths.read only when the user allows it', () => {
		const approvals = new MemoryLocalClientApprovals()
		const approvalId = approvals.request('Claude Code')
		approvals.allow(approvalId, {pathsRead: true})
		expect(claimed(approvals.claim(approvalId)).rules).toEqual(['trusted', 'paths.read'])
	})

	it('refuses a denied, withdrawn or unknown request', () => {
		const approvals = new MemoryLocalClientApprovals()
		const denied = approvals.request('x')
		expect(approvals.deny(denied)).toBe(true)
		expect(approvals.claim(denied)).toEqual({status: 'refused'})
		const withdrawn = approvals.request('y')
		approvals.withdraw(withdrawn)
		expect(approvals.pending()).toEqual([])
		expect(approvals.claim(withdrawn)).toEqual({status: 'refused'})
		expect(approvals.claim('nope')).toEqual({status: 'refused'})
		expect(approvals.allow('nope')).toBe(false)
	})

	it('tells listeners when a client is removed', () => {
		const approvals = new MemoryLocalClientApprovals()
		const revoked: string[] = []
		const stop = approvals.onRevoked(clientId => revoked.push(clientId))
		const approvalId = approvals.request('y')
		approvals.allow(approvalId)
		const client = claimed(approvals.claim(approvalId))
		approvals.confirm(approvalId)
		expect(approvals.remove(client.clientId)).toBe(true)
		expect(approvals.client(client.clientId)).toBeNull()
		expect(revoked).toEqual([client.clientId])
		stop()
		expect(approvals.remove(client.clientId)).toBe(false)
		expect(revoked).toHaveLength(1)
	})

	it('expires an allowed approval nobody collected', () => {
		const clock = {now: 0}
		const approvals = new MemoryLocalClientApprovals({now: () => clock.now})
		const approvalId = approvals.request('x')
		clock.now = 5_000
		approvals.allow(approvalId)
		clock.now = 5_000 + ALLOWED_APPROVAL_TTL_MS
		expect(approvals.claim(approvalId).status).toBe('allowed')
		approvals.release(approvalId)
		clock.now += 1
		expect(approvals.claim(approvalId)).toEqual({status: 'refused'})
	})

	it('drops the oldest pending request past the cap', () => {
		const approvals = new MemoryLocalClientApprovals()
		const first = approvals.request('first')
		for (let i = 0; i < PENDING_APPROVALS_MAX; i++) approvals.request(`n${i}`)
		expect(approvals.pending()).toHaveLength(PENDING_APPROVALS_MAX)
		expect(approvals.claim(first)).toEqual({status: 'refused'})
	})

	it('allows at once when built to auto-allow (E2E runs only)', () => {
		const approvals = new MemoryLocalClientApprovals({autoAllow: true})
		const approvalId = approvals.request('arroxy-mcp')
		expect(approvals.pending()).toEqual([])
		expect(approvals.claim(approvalId).status).toBe('allowed')
	})
})
