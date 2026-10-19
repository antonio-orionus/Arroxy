import type {YtDlpErrorKind} from '@shared/schemas.js'
import type {CommonSettings, ProbeDegradationReason, ProbeError} from '@shared/types.js'
import {exploreSignInSiteFor, type ExploreSignInSite} from '../exploreSignInSite.js'

// `explore`: neutral copy — the cookies alert alone carries the Explore sign-in call.
export type BotWallGuidanceVariant = 'hidden' | 'unconfigured' | 'disabled' | 'enabled' | 'explore'
export type ConfiguredCookiesRetryMode = 'file' | 'browser'

type CookiesMode = NonNullable<CommonSettings['cookiesMode']>
export type ConfiguredCookiesMode = Exclude<CookiesMode, 'off'>

// `mode` is the effective mode: `off` also stands for `explore` with the Explore tab turned off.
// `explore-offer` / `explore-reuse` (P2-R51): `off` with the Explore tab on leads
// with Explore — sign in there first, or use the sign-in it already holds. The
// second way: "Enable cookies and retry" when a cookies file or browser is set
// up, else cookie settings.
// `site` (ADR 0011): where the sign-in is. Explore's signed-in flag is
// YouTube's, so a link on another site is never `explore-reuse` or
// `configured`: nothing says whether the user signed in there.
export type ExploreOfferSecondary = 'enable-cookies' | 'open-settings'
export type CookiesGuidance =
	| {variant: 'hidden'; mode: CookiesMode}
	| {variant: 'needs-cookies'; mode: 'off'}
	| {variant: 'explore-offer'; mode: 'off'; secondary: ExploreOfferSecondary; site: ExploreSignInSite}
	| {variant: 'explore-reuse'; mode: 'off'; secondary: ExploreOfferSecondary}
	| {variant: 'configured'; mode: ConfiguredCookiesMode}
	| {variant: 'dpapi'; mode: 'browser'}
	| {variant: 'explore-sign-in'; mode: 'explore'; site: ExploreSignInSite}
	// The failed run already used the Explore session: the site refused it signed
	// in, so nothing asks for a sign-in again. The surface's Retry is the way on.
	| {variant: 'explore-refused'; mode: 'off' | 'explore'}

export interface BotWallGuidance {
	variant: BotWallGuidanceVariant
}

// The site is rate-limiting this connection. `degraded`: the result came back
// usable but may be missing formats; `failed`: nothing came back. The remedy is
// waiting out main's cooldown (or "Try now"), never cookies or an account.
export type RateLimitGuidanceVariant = 'hidden' | 'degraded' | 'failed'
export interface RateLimitGuidance {
	variant: RateLimitGuidanceVariant
}

export interface ProbeErrorExperience {
	errorKind: YtDlpErrorKind | undefined
	cookies: CookiesGuidance
	botWall: BotWallGuidance
	rateLimit: RateLimitGuidance
	// signInWithExplore: open Explore to sign in (the `explore` mode's call).
	// signInWithExploreThenRetry: switch to `explore`, open Explore, retry once signed in (YouTube; another site's retry is the user's).
	// retryWithExploreSignIn: switch to `explore` and retry now.
	actions: {retry: boolean; openCookiesSettings: boolean; enableCookiesAndRetry: boolean; signInWithExplore: boolean; signInWithExploreThenRetry: boolean; retryWithExploreSignIn: boolean}
}

// The Explore view's YouTube sign-in flag; null while main has not answered yet.
export type ExploreSignedIn = boolean | null

interface ProbeErrorExperienceInput {
	error: ProbeError | null
	// The link that failed: which site's sign-in the guidance is about. None means YouTube.
	url?: string | null
	commonSettings?: Partial<CommonSettings> | null
	degradedReasons?: readonly ProbeDegradationReason[] | null
	exploreSignedIn?: ExploreSignedIn
}

const COOKIES_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['botBlock', 'ageRestricted', 'unavailable', 'loginRequired'])
const BOT_WALL_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['botBlock'])

export function isCookiesNeededKind(kind: YtDlpErrorKind | undefined): boolean {
	return kind !== undefined && COOKIES_KINDS.has(kind)
}

export function isBotWallKind(kind: YtDlpErrorKind | undefined): boolean {
	return kind !== undefined && BOT_WALL_KINDS.has(kind)
}

export function isDpapiCookieError(text: string | undefined | null): boolean {
	if (!text) return false
	return /Failed to decrypt with DPAPI|no encrypted key in Local State/i.test(text)
}

function probeErrorKind(error: ProbeError | null): YtDlpErrorKind | undefined {
	return error?.kind === 'ytdlp' ? error.error.kind : undefined
}

function probeErrorRaw(error: ProbeError | null): string | null {
	if (!error) return null
	if (error.kind === 'ytdlp') return error.error.raw
	return error.message + (error.details ? `\n${error.details}` : '')
}

function hasConfiguredCookies(commonSettings: Partial<CommonSettings> | null | undefined): boolean {
	return Boolean(commonSettings?.cookiesPath?.trim()) || Boolean(commonSettings?.cookiesBrowser)
}

export function configuredCookiesRetryMode(commonSettings: Partial<CommonSettings> | null | undefined): ConfiguredCookiesRetryMode | null {
	if (commonSettings?.cookiesPath?.trim()) return 'file'
	if (commonSettings?.cookiesBrowser) return 'browser'
	return null
}

// The kill switch also disables escalation (spec D3), so `explore` with the
// Explore tab turned off behaves, and is guided, like `off`.
function effectiveCookiesMode(commonSettings: Partial<CommonSettings> | null | undefined): CookiesMode {
	const mode = commonSettings?.cookiesMode ?? 'off'
	return mode === 'explore' && commonSettings?.exploreEnabled === false ? 'off' : mode
}

// Only a stored `off` with the Explore tab on, for a failure an account can fix
// (the kinds escalation reaches, so never a rate limit). `file` / `browser` are
// never overridden.
// Nothing is offered before the settings load: the stored mode is not known yet.
function offersExplore(commonSettings: Partial<CommonSettings> | null | undefined, errorKind: YtDlpErrorKind | undefined): boolean {
	return commonSettings != null && canSwitchToExplore(commonSettings) && isCookiesNeededKind(errorKind)
}

// The only mode the Explore offer may replace: a stored `off`, with the Explore tab on.
export function canSwitchToExplore(commonSettings: Partial<CommonSettings> | null | undefined): boolean {
	return commonSettings != null && (commonSettings.cookiesMode ?? 'off') === 'off' && commonSettings.exploreEnabled !== false
}

function cookiesGuidanceVariant(input: {commonSettings?: Partial<CommonSettings> | null; error: ProbeError | null; errorKind: YtDlpErrorKind | undefined; exploreSignedIn: ExploreSignedIn; site: ExploreSignInSite}): CookiesGuidance {
	const mode = effectiveCookiesMode(input.commonSettings)
	const {site} = input
	const refusedSignedIn = input.error?.kind === 'ytdlp' && input.error.auth === 'exploreSession'
	const signedIn = site.kind === 'youtube' && input.exploreSignedIn === true
	// No cookie can lift a rate limit, under any mode: YouTube limits accounts too.
	if (input.errorKind === 'rateLimit') return {mode, variant: 'hidden'}
	// The failed run already used the Explore session for a failure an account
	// might fix, or for a line nothing could name (main escalates a page another
	// site's extractor could not parse). Only where the Explore offer would show.
	if (refusedSignedIn && (isCookiesNeededKind(input.errorKind) || input.errorKind === 'unknown') && (mode === 'explore' || (mode === 'off' && canSwitchToExplore(input.commonSettings)))) return {mode, variant: 'explore-refused'}
	switch (mode) {
		case 'off':
			if (offersExplore(input.commonSettings, input.errorKind)) {
				const secondary = configuredCookiesRetryMode(input.commonSettings) ? 'enable-cookies' : 'open-settings'
				return signedIn ? {mode, variant: 'explore-reuse', secondary} : {mode, variant: 'explore-offer', secondary, site}
			}
			return isCookiesNeededKind(input.errorKind) ? {mode, variant: 'needs-cookies'} : {mode, variant: 'hidden'}
		case 'explore':
			// Escalation only reaches failures an account can fix; other errors say nothing about the sign-in.
			if (!isCookiesNeededKind(input.errorKind)) return {mode, variant: 'hidden'}
			return signedIn ? {mode, variant: 'configured'} : {mode, variant: 'explore-sign-in', site}
		case 'browser':
			return isDpapiCookieError(probeErrorRaw(input.error)) ? {mode, variant: 'dpapi'} : {mode, variant: 'configured'}
		case 'file':
			return {mode, variant: 'configured'}
	}
}

function botWallGuidanceVariant(input: {commonSettings?: Partial<CommonSettings> | null; degradedReasons?: readonly ProbeDegradationReason[] | null; errorKind: YtDlpErrorKind | undefined}): BotWallGuidance {
	const isBotWall = isBotWallKind(input.errorKind) || (input.degradedReasons?.includes('botWall') ?? false)
	if (!isBotWall) return {variant: 'hidden'}
	// The cookies alert carries the Explore offer; this one stays neutral (P2-R19).
	if (offersExplore(input.commonSettings, input.errorKind)) return {variant: 'explore'}
	switch (effectiveCookiesMode(input.commonSettings)) {
		case 'off':
			// Under `explore` (Explore tab off), "Enable cookies and retry" would silently
			// move the user off the explore mode: point to cookie settings instead.
			return {variant: input.commonSettings?.cookiesMode !== 'explore' && hasConfiguredCookies(input.commonSettings) ? 'disabled' : 'unconfigured'}
		case 'explore':
			return {variant: 'explore'}
		case 'file':
		case 'browser':
			return {variant: 'enabled'}
	}
}

function rateLimitGuidanceVariant(degradedReasons: readonly ProbeDegradationReason[] | null | undefined, errorKind: YtDlpErrorKind | undefined): RateLimitGuidance {
	if (errorKind === 'rateLimit') return {variant: 'failed'}
	return {variant: degradedReasons?.includes('rateLimit') ? 'degraded' : 'hidden'}
}

export function buildProbeErrorExperience({error, url = null, commonSettings = null, degradedReasons = null, exploreSignedIn = null}: ProbeErrorExperienceInput): ProbeErrorExperience {
	const errorKind = probeErrorKind(error)
	const cookies = cookiesGuidanceVariant({commonSettings, error, errorKind, exploreSignedIn, site: exploreSignInSiteFor(url)})
	const botWall = botWallGuidanceVariant({commonSettings, degradedReasons, errorKind})
	const rateLimit = rateLimitGuidanceVariant(degradedReasons, errorKind)
	const signInWithExplore = cookies.variant === 'explore-sign-in'
	const offerSecondary = cookies.variant === 'explore-offer' || cookies.variant === 'explore-reuse' ? cookies.secondary : null
	return {
		errorKind,
		cookies,
		botWall,
		rateLimit,
		actions: {
			retry: error !== null,
			openCookiesSettings: cookies.variant !== 'hidden' && cookies.variant !== 'explore-refused' && !signInWithExplore && offerSecondary !== 'enable-cookies',
			enableCookiesAndRetry: botWall.variant === 'disabled' || offerSecondary === 'enable-cookies',
			signInWithExplore,
			signInWithExploreThenRetry: cookies.variant === 'explore-offer',
			retryWithExploreSignIn: cookies.variant === 'explore-reuse'
		}
	}
}

function guidanceScore(error: ProbeError, commonSettings: Partial<CommonSettings> | null | undefined, exploreSignedIn: ExploreSignedIn): number {
	const experience = buildProbeErrorExperience({error, commonSettings, exploreSignedIn})
	if (experience.actions.enableCookiesAndRetry) return 3
	if (experience.cookies.variant !== 'hidden') return 2
	if (experience.botWall.variant !== 'hidden' || experience.rateLimit.variant !== 'hidden') return 1
	return 0
}

export function selectProbeErrorForGuidance(errors: readonly ProbeError[], commonSettings: Partial<CommonSettings> | null | undefined, exploreSignedIn: ExploreSignedIn = null): ProbeError | null {
	let selected: ProbeError | null = null
	let selectedScore = -1
	for (const error of errors) {
		const score = guidanceScore(error, commonSettings, exploreSignedIn)
		if (score <= selectedScore) continue
		selected = error
		selectedScore = score
		if (score === 3) break
	}
	return selected
}
