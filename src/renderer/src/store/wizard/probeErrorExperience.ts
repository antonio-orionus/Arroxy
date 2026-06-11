import type {YtDlpErrorKind} from '@shared/schemas.js'
import type {CommonSettings, ProbeDegradationReason, ProbeError} from '@shared/types.js'

export type CookiesGuidanceVariant = 'hidden' | 'needs-cookies' | 'configured' | 'dpapi'
export type BotWallGuidanceVariant = 'hidden' | 'unconfigured' | 'disabled' | 'enabled'
export type ConfiguredCookiesRetryMode = 'file' | 'browser'

export interface CookiesGuidance {
	variant: CookiesGuidanceVariant
	mode: NonNullable<CommonSettings['cookiesMode']>
}

export interface BotWallGuidance {
	variant: BotWallGuidanceVariant
}

export interface ProbeErrorExperience {
	errorKind: YtDlpErrorKind | undefined
	cookies: CookiesGuidance
	botWall: BotWallGuidance
	actions: {retry: boolean; openCookiesSettings: boolean; enableCookiesAndRetry: boolean}
}

interface ProbeErrorExperienceInput {
	error: ProbeError | null
	commonSettings?: Partial<CommonSettings> | null
	degradedReasons?: readonly ProbeDegradationReason[] | null
}

const COOKIES_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['botBlock', 'ageRestricted', 'unavailable', 'loginRequired'])
const BOT_WALL_KINDS: ReadonlySet<YtDlpErrorKind> = new Set(['botBlock', 'rateLimit'])

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

function cookiesGuidanceVariant(input: {commonSettings?: Partial<CommonSettings> | null; error: ProbeError | null; errorKind: YtDlpErrorKind | undefined}): CookiesGuidance {
	const mode = input.commonSettings?.cookiesMode ?? 'off'
	if (mode === 'off') {
		return {mode, variant: isCookiesNeededKind(input.errorKind) ? 'needs-cookies' : 'hidden'}
	}
	if (mode === 'browser' && isDpapiCookieError(probeErrorRaw(input.error))) return {mode, variant: 'dpapi'}
	return {mode, variant: 'configured'}
}

function botWallGuidanceVariant(input: {commonSettings?: Partial<CommonSettings> | null; degradedReasons?: readonly ProbeDegradationReason[] | null; errorKind: YtDlpErrorKind | undefined}): BotWallGuidance {
	const isBotWall = isBotWallKind(input.errorKind) || (input.degradedReasons?.includes('botWall') ?? false)
	if (!isBotWall) return {variant: 'hidden'}
	const mode = input.commonSettings?.cookiesMode ?? 'off'
	if (mode !== 'off') return {variant: 'enabled'}
	return {variant: hasConfiguredCookies(input.commonSettings) ? 'disabled' : 'unconfigured'}
}

export function buildProbeErrorExperience({error, commonSettings = null, degradedReasons = null}: ProbeErrorExperienceInput): ProbeErrorExperience {
	const errorKind = probeErrorKind(error)
	const cookies = cookiesGuidanceVariant({commonSettings, error, errorKind})
	const botWall = botWallGuidanceVariant({commonSettings, degradedReasons, errorKind})
	return {errorKind, cookies, botWall, actions: {retry: error !== null, openCookiesSettings: cookies.variant !== 'hidden', enableCookiesAndRetry: botWall.variant === 'disabled'}}
}

function guidanceScore(error: ProbeError, commonSettings: Partial<CommonSettings> | null | undefined): number {
	const experience = buildProbeErrorExperience({error, commonSettings})
	if (experience.actions.enableCookiesAndRetry) return 3
	if (experience.actions.openCookiesSettings) return 2
	if (experience.botWall.variant !== 'hidden') return 1
	return 0
}

export function selectProbeErrorForGuidance(errors: readonly ProbeError[], commonSettings: Partial<CommonSettings> | null | undefined): ProbeError | null {
	let selected: ProbeError | null = null
	let selectedScore = -1
	for (const error of errors) {
		const score = guidanceScore(error, commonSettings)
		if (score <= selectedScore) continue
		selected = error
		selectedScore = score
		if (score === 3) break
	}
	return selected
}
