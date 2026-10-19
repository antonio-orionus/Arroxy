import {describe, expect, it} from 'vite-plus/test'
import en from '@shared/i18n/locales/en.json' with {type: 'json'}
import {YT_DLP_ERROR_KINDS, type YtDlpErrorKind} from '@shared/schemas.js'
import type {CommonSettings, ProbeError} from '@shared/types.js'
import {EXPLORE_ADDRESS_MAX} from '@shared/sites/exploreAddress.js'
import {exploreSignInSiteFor} from '@renderer/store/exploreSignInSite.js'
import {buildProbeErrorExperience, configuredCookiesRetryMode, type ExploreSignedIn, isBotWallKind, isCookiesNeededKind, isDpapiCookieError, selectProbeErrorForGuidance} from '@renderer/store/wizard/probeErrorExperience.js'

function ytdlpError(kind: YtDlpErrorKind, raw = `ERROR: ${kind}`): ProbeError {
	return {kind: 'ytdlp', error: {kind, raw}}
}

// `exploreEnabled: false` pins the pre-Explore guidance these cases describe.
describe('ProbeErrorExperience', () => {
	it('classifies every yt-dlp error kind through one interface', () => {
		const classified = YT_DLP_ERROR_KINDS.map(kind => buildProbeErrorExperience({error: ytdlpError(kind), commonSettings: {cookiesMode: 'off', exploreEnabled: false}}))

		expect(classified).toHaveLength(YT_DLP_ERROR_KINDS.length)
		for (const [index, experience] of classified.entries()) {
			expect(experience.errorKind).toBe(YT_DLP_ERROR_KINDS[index])
			expect(experience.actions.retry).toBe(true)
		}

		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'off', exploreEnabled: false}})).toMatchObject({cookies: {variant: 'needs-cookies'}, botWall: {variant: 'unconfigured'}, actions: {openCookiesSettings: true, enableCookiesAndRetry: false}})
		expect(buildProbeErrorExperience({error: ytdlpError('rateLimit'), commonSettings: {cookiesMode: 'off', exploreEnabled: false}})).toMatchObject({cookies: {variant: 'hidden'}, botWall: {variant: 'hidden'}, rateLimit: {variant: 'failed'}, actions: {openCookiesSettings: false, enableCookiesAndRetry: false}})
		expect(buildProbeErrorExperience({error: ytdlpError('network'), commonSettings: {cookiesMode: 'off', exploreEnabled: false}})).toMatchObject({cookies: {variant: 'hidden'}, botWall: {variant: 'hidden'}, actions: {openCookiesSettings: false, enableCookiesAndRetry: false}})
	})

	it('projects cookies and bot-wall variants from settings state', () => {
		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'off', exploreEnabled: false, cookiesPath: '/tmp/cookies.txt'}})).toMatchObject({cookies: {variant: 'needs-cookies'}, botWall: {variant: 'disabled'}, actions: {openCookiesSettings: true, enableCookiesAndRetry: true}})
		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'}})).toMatchObject({cookies: {variant: 'configured', mode: 'file'}, botWall: {variant: 'enabled'}, actions: {openCookiesSettings: true, enableCookiesAndRetry: false}})
		expect(buildProbeErrorExperience({error: ytdlpError('unknown', 'ERROR: Failed to decrypt with DPAPI'), commonSettings: {cookiesMode: 'browser', cookiesBrowser: 'chrome'}})).toMatchObject({cookies: {variant: 'dpapi', mode: 'browser'}, actions: {openCookiesSettings: true}})
		expect(buildProbeErrorExperience({error: null, degradedReasons: ['botWall'], commonSettings: {cookiesMode: 'off', exploreEnabled: false}})).toMatchObject({errorKind: undefined, cookies: {variant: 'hidden'}, botWall: {variant: 'unconfigured'}, actions: {retry: false}})
	})

	it('keeps low-level kind helpers available for narrow callers', () => {
		expect(isCookiesNeededKind('botBlock')).toBe(true)
		expect(isCookiesNeededKind('ageRestricted')).toBe(true)
		expect(isCookiesNeededKind('network')).toBe(false)
		expect(isBotWallKind('botBlock')).toBe(true)
		expect(isBotWallKind('rateLimit')).toBe(false)
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

		expect(selectProbeErrorForGuidance([], {cookiesMode: 'off', exploreEnabled: false})).toBeNull()
		expect(selectProbeErrorForGuidance([network, botBlock], {cookiesMode: 'off', exploreEnabled: false, cookiesPath: '/tmp/cookies.txt'})).toBe(botBlock)
		expect(selectProbeErrorForGuidance([network, ageRestricted], {cookiesMode: 'off', exploreEnabled: false})).toBe(ageRestricted)
		expect(selectProbeErrorForGuidance([network, rateLimit], {cookiesMode: 'off', exploreEnabled: false})).toBe(rateLimit)
		expect(selectProbeErrorForGuidance([network, ytdlpError('parse')], {cookiesMode: 'off', exploreEnabled: false})).toBe(network)
	})

	describe('under the explore cookie mode', () => {
		const EXPLORE = {cookiesMode: 'explore'} as const

		it('asks a signed-out user to sign in in Explore, from the cookies alert only', () => {
			const experience = buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: EXPLORE, exploreSignedIn: false})
			expect(experience).toMatchObject({cookies: {variant: 'explore-sign-in', mode: 'explore'}, botWall: {variant: 'explore'}, actions: {signInWithExplore: true, openCookiesSettings: false, enableCookiesAndRetry: false}})
		})

		it('treats a sign-in state not yet known as signed out', () => {
			for (const kind of ['ageRestricted', 'loginRequired', 'unavailable'] as const) {
				expect(buildProbeErrorExperience({error: ytdlpError(kind), commonSettings: EXPLORE}).cookies.variant).toBe('explore-sign-in')
				expect(buildProbeErrorExperience({error: ytdlpError(kind), commonSettings: EXPLORE, exploreSignedIn: null}).cookies.variant).toBe('explore-sign-in')
			}
		})

		it('tells a signed-in user their Explore sign-in was used', () => {
			expect(buildProbeErrorExperience({error: ytdlpError('loginRequired'), commonSettings: EXPLORE, exploreSignedIn: true})).toMatchObject({cookies: {variant: 'configured', mode: 'explore'}, actions: {signInWithExplore: false, openCookiesSettings: true, enableCookiesAndRetry: false}})
		})

		it('stays quiet about cookies for a failure an account cannot fix', () => {
			for (const exploreSignedIn of [true, false, null]) {
				expect(buildProbeErrorExperience({error: ytdlpError('network'), commonSettings: EXPLORE, exploreSignedIn})).toMatchObject({cookies: {variant: 'hidden'}, botWall: {variant: 'hidden'}, actions: {signInWithExplore: false, openCookiesSettings: false}})
			}
		})

		it('keeps bot-wall guidance free of a sign-in call on a degraded probe', () => {
			expect(buildProbeErrorExperience({error: null, degradedReasons: ['botWall'], commonSettings: EXPLORE, exploreSignedIn: false})).toMatchObject({cookies: {variant: 'hidden'}, botWall: {variant: 'explore'}, actions: {signInWithExplore: false, enableCookiesAndRetry: false}})
		})

		it('falls back to the off-mode guidance while the Explore tab is turned off', () => {
			const disabled = {...EXPLORE, exploreEnabled: false}
			expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: disabled, exploreSignedIn: false})).toMatchObject({cookies: {variant: 'needs-cookies'}, botWall: {variant: 'unconfigured'}, actions: {signInWithExplore: false, openCookiesSettings: true}})
		})

		it('never offers "Enable cookies and retry" under explore, which would silently leave the explore mode', () => {
			const disabled = {...EXPLORE, exploreEnabled: false}
			for (const stored of [{cookiesPath: '/tmp/cookies.txt'}, {cookiesBrowser: 'firefox' as const}]) {
				expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {...disabled, ...stored}, exploreSignedIn: true})).toMatchObject({cookies: {variant: 'needs-cookies'}, botWall: {variant: 'unconfigured'}, actions: {enableCookiesAndRetry: false, openCookiesSettings: true}})
				expect(buildProbeErrorExperience({error: null, degradedReasons: ['botWall'], commonSettings: {...disabled, ...stored}}).botWall.variant).toBe('unconfigured')
			}
		})

		it('selects the error a sign-in would fix', () => {
			const ageRestricted = ytdlpError('ageRestricted')
			expect(selectProbeErrorForGuidance([ytdlpError('network'), ytdlpError('rateLimit'), ageRestricted], EXPLORE, false)).toBe(ageRestricted)
		})
	})

	// P2-R51: under `off` with Explore enabled, a failure an account can fix
	// leads with Explore; every other combination keeps its guidance.
	describe('under the off cookie mode with Explore enabled', () => {
		const MODES = ['off', 'file', 'browser', 'explore'] as const
		const SIGNED_IN: readonly ExploreSignedIn[] = [true, false, null]
		const ENABLED = [undefined, true, false] as const

		function experience(kind: YtDlpErrorKind, common: Partial<CommonSettings>, exploreSignedIn: ExploreSignedIn) {
			return buildProbeErrorExperience({error: ytdlpError(kind), commonSettings: common, exploreSignedIn})
		}

		it('offers Sign in with Explore to a signed-out user (state not yet known included), cookie settings second', () => {
			for (const kind of ['botBlock', 'ageRestricted', 'unavailable', 'loginRequired'] as const) {
				for (const exploreSignedIn of [false, null]) {
					expect(experience(kind, {cookiesMode: 'off'}, exploreSignedIn)).toMatchObject({
						cookies: {variant: 'explore-offer', mode: 'off', secondary: 'open-settings'},
						actions: {signInWithExploreThenRetry: true, retryWithExploreSignIn: false, signInWithExplore: false, openCookiesSettings: true, enableCookiesAndRetry: false}
					})
				}
			}
		})

		it('offers "Use my Explore sign-in and retry" to a signed-in user who turned the mode off', () => {
			for (const kind of ['botBlock', 'ageRestricted', 'unavailable', 'loginRequired'] as const) {
				expect(experience(kind, {cookiesMode: 'off', exploreEnabled: true}, true)).toMatchObject({cookies: {variant: 'explore-reuse', mode: 'off'}, actions: {retryWithExploreSignIn: true, signInWithExploreThenRetry: false, signInWithExplore: false, openCookiesSettings: true, enableCookiesAndRetry: false}})
			}
		})

		it('keeps the bot-wall alert free of a second call (one alert carries it)', () => {
			for (const stored of [{}, {cookiesPath: '/tmp/cookies.txt'}, {cookiesBrowser: 'firefox' as const}]) {
				for (const exploreSignedIn of SIGNED_IN) {
					expect(experience('botBlock', {cookiesMode: 'off', ...stored}, exploreSignedIn).botWall.variant).toBe('explore')
				}
			}
		})

		// A cookies file or browser already set up: its second way is the one-click
		// "Enable cookies and retry", not a trip to the settings.
		it('offers Enable cookies and retry as the second way when cookies are already set up', () => {
			for (const [stored, secondary] of [
				[{}, 'open-settings'],
				[{cookiesPath: '/tmp/cookies.txt'}, 'enable-cookies'],
				[{cookiesBrowser: 'firefox' as const}, 'enable-cookies']
			] as const) {
				for (const exploreSignedIn of SIGNED_IN) {
					const enable = secondary === 'enable-cookies'
					expect(experience('loginRequired', {cookiesMode: 'off', ...stored}, exploreSignedIn)).toMatchObject({cookies: {secondary}, actions: {enableCookiesAndRetry: enable, openCookiesSettings: !enable}})
				}
			}
		})

		it('offers nothing about Explore until the settings have loaded', () => {
			for (const commonSettings of [null, undefined]) {
				const result = buildProbeErrorExperience({error: ytdlpError('loginRequired'), commonSettings, exploreSignedIn: false})
				expect(result.cookies.variant).not.toMatch(/^explore-/)
				expect(result.actions).toMatchObject({signInWithExploreThenRetry: false, retryWithExploreSignIn: false})
			}
		})

		it('never offers Explore for a rate limit, in any mode or sign-in state', () => {
			for (const cookiesMode of MODES) {
				for (const exploreSignedIn of SIGNED_IN) {
					for (const exploreEnabled of ENABLED) {
						const {cookies, actions} = experience('rateLimit', {cookiesMode, exploreEnabled}, exploreSignedIn)
						expect(cookies.variant).not.toMatch(/^explore-(offer|reuse)$/)
						expect(actions).toMatchObject({signInWithExploreThenRetry: false, retryWithExploreSignIn: false, signInWithExplore: false})
					}
				}
			}
		})

		it('leaves every other combination as it was: kill switch off, file, browser, explore, and failures an account cannot fix', () => {
			for (const kind of YT_DLP_ERROR_KINDS) {
				for (const exploreSignedIn of SIGNED_IN) {
					// The kill switch off: what `off` always offered.
					const legacyOff = experience(kind, {cookiesMode: 'off', exploreEnabled: false}, exploreSignedIn)
					expect(legacyOff.actions).toMatchObject({signInWithExploreThenRetry: false, retryWithExploreSignIn: false})
					if (!isCookiesNeededKind(kind)) {
						for (const exploreEnabled of [undefined, true] as const) expect(experience(kind, {cookiesMode: 'off', exploreEnabled}, exploreSignedIn)).toEqual(legacyOff)
					}
					for (const cookiesMode of ['file', 'browser'] as const) {
						const reference = experience(kind, {cookiesMode, exploreEnabled: false}, null)
						for (const exploreEnabled of ENABLED) expect(experience(kind, {cookiesMode, exploreEnabled}, exploreSignedIn)).toEqual(reference)
						expect(reference.actions).toMatchObject({signInWithExploreThenRetry: false, retryWithExploreSignIn: false})
					}
					for (const exploreEnabled of ENABLED) {
						expect(experience(kind, {cookiesMode: 'explore', exploreEnabled}, exploreSignedIn).actions).toMatchObject({signInWithExploreThenRetry: false, retryWithExploreSignIn: false})
					}
				}
			}
		})

		it('selects the error a sign-in would fix', () => {
			const ageRestricted = ytdlpError('ageRestricted')
			expect(selectProbeErrorForGuidance([ytdlpError('network'), ytdlpError('rateLimit'), ageRestricted], {cookiesMode: 'off'}, false)).toBe(ageRestricted)
		})
	})
})

// The error line sits next to the guidance alert on the row and the wizard
// error step: for a failure an account can fix it states the reason only, and
// leaves the way forward (Explore, a cookies file, a browser) to the alert.
describe('the error message beside the guidance', () => {
	it.each(['botBlock', 'ageRestricted', 'unavailable', 'loginRequired'] as const)('%s gives no cookie instructions of its own', kind => {
		expect(isCookiesNeededKind(kind)).toBe(true)
		expect(en.errors.ytdlp[kind]).not.toMatch(/cookie|settings/i)
	})
})

// A rate limit is fixed by waiting, never by cookies or an account: YouTube
// rate-limits signed-in accounts too. Its guidance is its own, apart from the
// bot wall's.
describe('ProbeErrorExperience — rate limit', () => {
	const SETTINGS: Partial<CommonSettings>[] = [
		{cookiesMode: 'off', exploreEnabled: false},
		{cookiesMode: 'off', exploreEnabled: true},
		{cookiesMode: 'off', exploreEnabled: false, cookiesPath: '/tmp/cookies.txt'},
		{cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'},
		{cookiesMode: 'browser', cookiesBrowser: 'chrome'},
		{cookiesMode: 'explore', exploreEnabled: true}
	]

	it('a failed probe gets the rate-limit guidance and no cookie, account or bot-wall advice, under every cookie mode', () => {
		for (const commonSettings of SETTINGS) {
			for (const exploreSignedIn of [true, false, null] as const) {
				expect(buildProbeErrorExperience({error: ytdlpError('rateLimit'), commonSettings, exploreSignedIn})).toMatchObject({
					rateLimit: {variant: 'failed'},
					botWall: {variant: 'hidden'},
					cookies: {variant: 'hidden'},
					actions: {enableCookiesAndRetry: false, signInWithExplore: false, signInWithExploreThenRetry: false, retryWithExploreSignIn: false}
				})
			}
		}
	})

	it('a usable result limited by the rate limit gets the degraded guidance, without the bot wall', () => {
		for (const commonSettings of SETTINGS) {
			expect(buildProbeErrorExperience({error: null, degradedReasons: ['rateLimit'], commonSettings})).toMatchObject({rateLimit: {variant: 'degraded'}, botWall: {variant: 'hidden'}, actions: {enableCookiesAndRetry: false}})
		}
	})

	it('a bot wall and a rate limit in one result keep their own guidance', () => {
		expect(buildProbeErrorExperience({error: null, degradedReasons: ['botWall', 'rateLimit'], commonSettings: {cookiesMode: 'off', exploreEnabled: false}})).toMatchObject({rateLimit: {variant: 'degraded'}, botWall: {variant: 'unconfigured'}})
	})

	it('shows nothing about a rate limit otherwise', () => {
		expect(buildProbeErrorExperience({error: ytdlpError('botBlock'), commonSettings: {cookiesMode: 'off'}}).rateLimit.variant).toBe('hidden')
		expect(buildProbeErrorExperience({error: null, degradedReasons: ['extractor'], commonSettings: {cookiesMode: 'off'}}).rateLimit.variant).toBe('hidden')
	})
})

// ADR 0011: Explore browses any site, but its signed-in flag is YouTube's
// own. Another site's failure leads to that site and never reads the flag.
describe('Explore sign-in guidance for a link on another site', () => {
	const VIMEO = 'https://vimeo.com/123456'
	const VIMEO_SITE = {kind: 'web', host: 'vimeo.com', address: VIMEO} as const

	it('leads to the link itself under the explore mode, signed in to YouTube or not', () => {
		for (const exploreSignedIn of [true, false, null]) {
			expect(buildProbeErrorExperience({error: ytdlpError('loginRequired'), url: VIMEO, commonSettings: {cookiesMode: 'explore'}, exploreSignedIn})).toMatchObject({cookies: {variant: 'explore-sign-in', mode: 'explore', site: VIMEO_SITE}, actions: {signInWithExplore: true, openCookiesSettings: false}})
		}
	})

	it('offers Sign in with Explore under the off mode, never the YouTube sign-in Explore holds', () => {
		for (const exploreSignedIn of [true, false, null]) {
			expect(buildProbeErrorExperience({error: ytdlpError('ageRestricted'), url: VIMEO, commonSettings: {cookiesMode: 'off'}, exploreSignedIn})).toMatchObject({cookies: {variant: 'explore-offer', mode: 'off', site: VIMEO_SITE}, actions: {signInWithExploreThenRetry: true, retryWithExploreSignIn: false}})
		}
	})

	it('keeps YouTube guidance for YouTube links and for a failure without a link', () => {
		for (const url of ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://youtu.be/dQw4w9WgXcQ', 'https://music.youtube.com/watch?v=x', null, undefined]) {
			expect(buildProbeErrorExperience({error: ytdlpError('loginRequired'), url, commonSettings: {cookiesMode: 'explore'}, exploreSignedIn: true}).cookies).toEqual({variant: 'configured', mode: 'explore'})
			expect(buildProbeErrorExperience({error: ytdlpError('loginRequired'), url, commonSettings: {cookiesMode: 'explore'}, exploreSignedIn: false}).cookies).toEqual({variant: 'explore-sign-in', mode: 'explore', site: {kind: 'youtube'}})
		}
	})

	it('still says nothing about a sign-in for a failure no account can fix', () => {
		expect(buildProbeErrorExperience({error: ytdlpError('network'), url: VIMEO, commonSettings: {cookiesMode: 'explore'}}).cookies.variant).toBe('hidden')
		expect(buildProbeErrorExperience({error: ytdlpError('rateLimit'), url: VIMEO, commonSettings: {cookiesMode: 'off'}}).cookies.variant).toBe('hidden')
	})
})

describe('exploreSignInSiteFor', () => {
	it('names the host without www and opens the link itself', () => {
		expect(exploreSignInSiteFor('https://www.instagram.com/p/abc/?igsh=1')).toEqual({kind: 'web', host: 'instagram.com', address: 'https://www.instagram.com/p/abc/?igsh=1'})
		expect(exploreSignInSiteFor('  http://example.test:8080/v  ')).toEqual({kind: 'web', host: 'example.test', address: 'http://example.test:8080/v'})
	})

	it('opens the site front page for a link Explore would not take as typed', () => {
		expect(exploreSignInSiteFor(`https://x.com/i/status/1?${'q'.repeat(EXPLORE_ADDRESS_MAX)}`)).toEqual({kind: 'web', host: 'x.com', address: 'https://x.com'})
		expect(exploreSignInSiteFor('https://user:secret@vimeo.com/1')).toEqual({kind: 'web', host: 'vimeo.com', address: 'https://vimeo.com'})
	})

	it('falls back to YouTube for YouTube and for anything that is not a web link', () => {
		for (const url of ['https://m.youtube.com/watch?v=x', 'not a url', 'file:///tmp/a.mp4', 'ytsearch:cats', '', null]) expect(exploreSignInSiteFor(url)).toEqual({kind: 'youtube'})
	})
})

// A run that already used the Explore session and still failed: another
// sign-in would not help, so nothing asks for one (an upstream refusal, such
// as Instagram's API answering 500, reads to yt-dlp as "You need to log in").
describe('a failure the Explore session already ran into', () => {
	function signedInError(kind: YtDlpErrorKind): ProbeError {
		return {kind: 'ytdlp', error: {kind, raw: `ERROR: ${kind}`}, auth: 'exploreSession'}
	}
	const INSTAGRAM = 'https://www.instagram.com/stories/highlights/1/'

	it('says the site refused it even signed in, and offers only Retry', () => {
		for (const url of [INSTAGRAM, 'https://www.youtube.com/watch?v=x']) {
			for (const exploreSignedIn of [true, false, null]) {
				expect(buildProbeErrorExperience({error: signedInError('loginRequired'), url, commonSettings: {cookiesMode: 'explore'}, exploreSignedIn})).toMatchObject({
					cookies: {variant: 'explore-refused', mode: 'explore'},
					actions: {retry: true, signInWithExplore: false, signInWithExploreThenRetry: false, retryWithExploreSignIn: false, openCookiesSettings: false, enableCookiesAndRetry: false}
				})
			}
		}
	})

	it('never offers Sign in with Explore under the off mode either', () => {
		expect(buildProbeErrorExperience({error: signedInError('ageRestricted'), url: INSTAGRAM, commonSettings: {cookiesMode: 'off'}, exploreSignedIn: true})).toMatchObject({cookies: {variant: 'explore-refused', mode: 'off'}, actions: {signInWithExploreThenRetry: false, retryWithExploreSignIn: false}})
	})

	it('leaves a file or browser mode and an unrelated failure as they were', () => {
		expect(buildProbeErrorExperience({error: signedInError('loginRequired'), commonSettings: {cookiesMode: 'file', cookiesPath: '/tmp/c.txt'}}).cookies).toEqual({variant: 'configured', mode: 'file'})
		expect(buildProbeErrorExperience({error: signedInError('network'), url: INSTAGRAM, commonSettings: {cookiesMode: 'explore'}}).cookies.variant).toBe('hidden')
	})
})
