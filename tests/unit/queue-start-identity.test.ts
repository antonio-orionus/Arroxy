// @vitest-environment node
import {describe, expect, it} from 'vite-plus/test'
import {resolveStartIdentity} from '@main/services/download/queueStartIdentity.js'
import type {StartDecision} from '@main/services/startIdentity.js'
import {makeItem} from '../shared/fixtures.js'

const REF = {id: '00000000-0000-4000-8000-000000000001', createdAt: '2026-10-23T00:00:00.000Z'}
const IG = 'https://www.instagram.com/reel/a'
const signedInByDefault = (): StartDecision => ({site: 'instagram', auth: 'exploreSession', basis: 'siteDefault'})
const anonymousByDefault = (): StartDecision => ({site: 'instagram', auth: 'anonymous', reason: 'noSignInCookie'})

describe('resolveStartIdentity', () => {
	it('keeps an escalated row on the Explore session, whatever its site says now', () => {
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG, auth: 'exploreSession'}), anonymousByDefault)).toEqual({auth: 'exploreSession', basis: 'escalation', replayProbeInfoJson: false})
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG, probeInfoJsonRef: {...REF, auth: 'exploreSession'}}), anonymousByDefault)).toEqual({auth: 'exploreSession', basis: 'escalation', replayProbeInfoJson: true})
	})

	it('decides a row with no recorded identity by its site, at every start', () => {
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG}), signedInByDefault)).toEqual({auth: 'exploreSession', basis: 'siteDefault', replayProbeInfoJson: false})
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG}), anonymousByDefault)).toEqual({auth: 'anonymous', replayProbeInfoJson: false})
	})

	it('replays a site-default probe only while its site still starts signed in', () => {
		const ref = {...REF, auth: 'exploreSession' as const, authBasis: 'siteDefault' as const}
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG, probeInfoJsonRef: ref}), signedInByDefault)).toMatchObject({auth: 'exploreSession', basis: 'siteDefault', replayProbeInfoJson: true})
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG, probeInfoJsonRef: ref}), anonymousByDefault)).toEqual({auth: 'anonymous', replayProbeInfoJson: false})
	})

	it('keeps a row its safety launch ran anonymous on anonymous', () => {
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG, auth: 'anonymous'}), signedInByDefault)).toEqual({auth: 'anonymous', replayProbeInfoJson: false})
	})

	it('replays an anonymous probe for an anonymous start', () => {
		expect(resolveStartIdentity(makeItem({id: 'a', status: 'pending', url: IG, probeInfoJsonRef: REF}), anonymousByDefault)).toEqual({auth: 'anonymous', replayProbeInfoJson: true})
	})
})
