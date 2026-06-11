import {describe, expect, it} from 'vitest'
import {YT_DLP_ERROR_KINDS, type YtDlpErrorKind} from '@shared/schemas.js'
import type {ProbeError} from '@shared/types.js'
import {buildProbeErrorExperience, configuredCookiesRetryMode, isBotWallKind, isCookiesNeededKind, isDpapiCookieError, selectProbeErrorForGuidance} from '@renderer/store/wizard/probeErrorExperience.js'

function ytdlpError(kind: YtDlpErrorKind, raw = `ERROR: ${kind}`): ProbeError {
	return {kind: 'ytdlp', error: {kind, raw}}
}

describe('ProbeErrorExperience', () => {
	it('classifies every yt-dlp error kind through one interface', () => {
		const classified = YT_DLP_ERROR_KINDS.map(kind => buildProbeErrorExperience({error: ytdlpError(kind), commonSettings: {cookiesMode: 'off'}}))

		expect(classified).toHaveLength(YT_DLP_ERROR_KINDS.length)
		for (const [index, experience] of classified.entries()) {
			expect(experience.errorKind).toBe(YT_DLP_ERROR_KINDS[index])
			expect(experience.actions.retry).toBe(true)
		}

		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'off'}})).toMatchObject({cookies: {variant: 'needs-cookies'}, botWall: {variant: 'unconfigured'}, actions: {openCookiesSettings: true, enableCookiesAndRetry: false}})
		expect(buildProbeErrorExperience({error: ytdlpError('rateLimit'), commonSettings: {cookiesMode: 'off'}})).toMatchObject({cookies: {variant: 'hidden'}, botWall: {variant: 'unconfigured'}, actions: {openCookiesSettings: false, enableCookiesAndRetry: false}})
		expect(buildProbeErrorExperience({error: ytdlpError('network'), commonSettings: {cookiesMode: 'off'}})).toMatchObject({cookies: {variant: 'hidden'}, botWall: {variant: 'hidden'}, actions: {openCookiesSettings: false, enableCookiesAndRetry: false}})
	})

	it('projects cookies and bot-wall variants from settings state', () => {
		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'}})).toMatchObject({cookies: {variant: 'needs-cookies'}, botWall: {variant: 'disabled'}, actions: {openCookiesSettings: true, enableCookiesAndRetry: true}})
		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}})).toMatchObject({cookies: {variant: 'configured', mode: 'file'}, botWall: {variant: 'enabled'}, actions: {openCookiesSettings: true, enableCookiesAndRetry: false}})
		expect(buildProbeErrorExperience({error: ytdlpError('unknown', 'ERROR: Failed to decrypt with DPAPI'), commonSettings: {cookiesMode: 'browser', cookiesBrowser: 'chrome'}})).toMatchObject({cookies: {variant: 'dpapi', mode: 'browser'}, actions: {openCookiesSettings: true}})
		expect(buildProbeErrorExperience({error: null, degradedReasons: ['botWall'], commonSettings: {cookiesMode: 'off'}})).toMatchObject({errorKind: undefined, cookies: {variant: 'hidden'}, botWall: {variant: 'unconfigured'}, actions: {retry: false}})
	})

	it('keeps low-level kind helpers available for narrow callers', () => {
		expect(isCookiesNeededKind('botBlock')).toBe(true)
		expect(isCookiesNeededKind('ageRestricted')).toBe(true)
		expect(isCookiesNeededKind('network')).toBe(false)
		expect(isBotWallKind('botBlock')).toBe(true)
		expect(isBotWallKind('rateLimit')).toBe(true)
		expect(isBotWallKind('ageRestricted')).toBe(false)
		expect(isDpapiCookieError('no encrypted key in Local State')).toBe(true)
		expect(isDpapiCookieError('ordinary probe failure')).toBe(false)
	})

	it('chooses a configured cookies retry mode with file precedence', () => {
		expect(configuredCookiesRetryMode(null)).toBeNull()
		expect(configuredCookiesRetryMode({cookiesMode: 'off'})).toBeNull()
		expect(configuredCookiesRetryMode({cookiesMode: 'off', cookiesPath: ' /tmp/cookies.txt '})).toBe('file')
		expect(configuredCookiesRetryMode({cookiesMode: 'off', cookiesBrowser: 'firefox'})).toBe('browser')
		expect(configuredCookiesRetryMode({cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt', cookiesBrowser: 'firefox'})).toBe('file')
	})

	it('selects the most actionable probe error for compact guidance', () => {
		const network = ytdlpError('network')
		const rateLimit = ytdlpError('rateLimit')
		const botBlock = ytdlpError('botBlock')
		const ageRestricted = ytdlpError('ageRestricted')

		expect(selectProbeErrorForGuidance([], {cookiesMode: 'off'})).toBeNull()
		expect(selectProbeErrorForGuidance([network, botBlock], {cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt'})).toBe(botBlock)
		expect(selectProbeErrorForGuidance([network, ageRestricted], {cookiesMode: 'off'})).toBe(ageRestricted)
		expect(selectProbeErrorForGuidance([network, rateLimit], {cookiesMode: 'off'})).toBe(rateLimit)
		expect(selectProbeErrorForGuidance([network, ytdlpError('parse')], {cookiesMode: 'off'})).toBe(network)
	})
})
