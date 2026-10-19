import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {StepError} from '@renderer/components/wizard/StepError.js'
import {RateLimitNotice} from '@renderer/components/wizard/format/RateLimitNotice.js'
import {QuickDownloadErrorAlert} from '@renderer/components/wizard/QuickDownloadErrorAlert.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {RESET_WIZARD_STATE} from '@renderer/store/wizard/commands.js'
import {buildProbeErrorExperience} from '@renderer/store/wizard/probeErrorExperience.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {AppSettings, ProbeError, SiteCooldown} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// A rate limit is lifted by waiting, never by cookies or an account (YouTube
// rate-limits accounts too). Its alert says when Arroxy asks the site again
// and replaces the immediate Retry with "Try now", which lets one request
// through main's cooldown; once the cooldown is over, a plain Retry.

const URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
const RATE_LIMIT: ProbeError = {kind: 'ytdlp', error: {kind: 'rateLimit', raw: 'ERROR: [youtube] dQw4w9WgXcQ: Unable to download webpage: HTTP Error 429: Too Many Requests'}}
// Every cookie mode, including the ones whose bot-wall copy gives cookie advice.
const COOKIE_MODES: Partial<AppSettings['common']>[] = [
	{cookiesMode: 'off', exploreEnabled: false},
	{cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt', exploreEnabled: false},
	{cookiesMode: 'file', cookiesPath: '/tmp/cookies.txt'},
	{cookiesMode: 'browser', cookiesBrowser: 'chrome'},
	{cookiesMode: 'explore', exploreEnabled: true}
]

const retry = vi.fn()
const retryFormatProbe = vi.fn()

function cooldown(evidence: SiteCooldown['evidence'] = 'rateLimited', ms = 60_000): SiteCooldown {
	return {site: 'youtube', until: new Date(Date.now() + ms).toISOString(), evidence}
}

function seed(state: {common?: Partial<AppSettings['common']>; cooldowns?: SiteCooldown[]; wizardError?: ProbeError | null; degraded?: boolean} = {}): void {
	const base = defaultAppSettings('/tmp')
	useAppStore.setState({
		...RESET_WIZARD_STATE,
		settings: {...base, common: {...base.common, ...state.common}},
		wizardUrl: URL,
		wizardStep: state.wizardError ? 'error' : 'formats',
		wizardError: state.wizardError ?? null,
		wizardErrorOrigin: state.wizardError ? 'formats' : null,
		wizardFormatsDegraded: state.degraded ? {reasons: ['rateLimit']} : null,
		siteCooldowns: state.cooldowns ?? [],
		retry,
		retryFormatProbe
	})
}

function expectNoCookieAdvice(): void {
	expect(screen.queryByTestId('cookies-error-alert')).not.toBeInTheDocument()
	expect(screen.queryByTestId('bot-wall-notice')).not.toBeInTheDocument()
	expect(screen.getByTestId('rate-limit-notice').textContent ?? '').not.toMatch(/cookie|sign in/i)
}

beforeEach(() => {
	retry.mockReset()
	retryFormatProbe.mockReset()
	window.appApi = buildMockAppApi()
})

afterEach(() => {
	vi.useRealTimers()
})

describe('the error step on a rate limit', () => {
	it.each(COOKIE_MODES)('gives no cookie advice and offers "Try now" in place of Retry (%o)', common => {
		seed({common, wizardError: RATE_LIMIT, cooldowns: [cooldown()]})
		render(<StepError />)

		expect(screen.getByTestId('rate-limit-notice')).toHaveAttribute('data-variant', 'failed')
		expect(screen.getByTestId('rate-limit-notice')).toHaveTextContent('YouTube is rate-limiting this connection')
		expect(screen.getByTestId('rate-limit-notice').textContent).toMatch(/Arroxy waits until .+ before asking YouTube again/)
		expectNoCookieAdvice()
		expect(screen.queryByTestId('btn-retry')).not.toBeInTheDocument()
		expect(screen.getByTestId('rate-limit-try-now')).toBeInTheDocument()
	})

	it('"Try now" lets one request through the cooldown, then retries', async () => {
		seed({wizardError: RATE_LIMIT, cooldowns: [cooldown()]})
		render(<StepError />)

		fireEvent.click(screen.getByTestId('rate-limit-try-now'))

		await waitFor(() => expect(retry).toHaveBeenCalledOnce())
		expect(window.appApi.siteRequests.tryNow).toHaveBeenCalledWith('youtube')
		expect(vi.mocked(window.appApi.siteRequests.tryNow).mock.invocationCallOrder[0]).toBeLessThan(retry.mock.invocationCallOrder[0])
	})

	it('offers a plain Retry once the cooldown is over', () => {
		seed({wizardError: RATE_LIMIT})
		render(<StepError />)

		expect(screen.getByTestId('rate-limit-notice')).toHaveTextContent('The wait is over')
		fireEvent.click(screen.getByTestId('rate-limit-retry'))
		expect(retry).toHaveBeenCalledOnce()
		expect(window.appApi.siteRequests.tryNow).not.toHaveBeenCalled()
	})

	it('switches from "Try now" to Retry when the cooldown runs out', () => {
		vi.useFakeTimers()
		seed({wizardError: RATE_LIMIT, cooldowns: [cooldown('rateLimited', 5_000)]})
		render(<StepError />)
		expect(screen.getByTestId('rate-limit-try-now')).toBeInTheDocument()

		act(() => {
			vi.advanceTimersByTime(5_000)
		})
		expect(screen.queryByTestId('rate-limit-try-now')).not.toBeInTheDocument()
		expect(screen.getByTestId('rate-limit-retry')).toBeInTheDocument()
	})

	it('says how long the session limit can last', () => {
		seed({wizardError: RATE_LIMIT, cooldowns: [cooldown('sessionRateLimited', 30 * 60_000)]})
		render(<StepError />)
		expect(screen.getByTestId('rate-limit-notice')).toHaveTextContent('YouTube can keep this limit for up to an hour.')
	})
})

describe('the Format screen on a rate-limited probe', () => {
	it('keeps the formats with the rate-limit notice and no cookie advice', () => {
		seed({common: {cookiesMode: 'off', cookiesPath: '/tmp/cookies.txt', exploreEnabled: false}, degraded: true, cooldowns: [cooldown()]})
		render(<RateLimitNotice />)

		expect(screen.getByTestId('rate-limit-notice')).toHaveAttribute('data-variant', 'degraded')
		expect(screen.getByTestId('rate-limit-notice')).toHaveTextContent('The format list may be incomplete.')
		expectNoCookieAdvice()
	})

	it('"Try now" re-fetches the formats through the cooldown', async () => {
		seed({degraded: true, cooldowns: [cooldown()]})
		render(<RateLimitNotice />)

		fireEvent.click(screen.getByTestId('rate-limit-try-now'))

		await waitFor(() => expect(retryFormatProbe).toHaveBeenCalledOnce())
		expect(window.appApi.siteRequests.tryNow).toHaveBeenCalledWith('youtube')
	})

	it('shows nothing for a result that was not rate-limited', () => {
		seed({cooldowns: [cooldown()]})
		render(<RateLimitNotice />)
		expect(screen.queryByTestId('rate-limit-notice')).not.toBeInTheDocument()
	})
})

describe('a failed quick download on a rate limit', () => {
	function renderAlert(common: Partial<AppSettings['common']>): {onRetry: ReturnType<typeof vi.fn>} {
		const onRetry = vi.fn()
		const base = defaultAppSettings('/tmp')
		const commonSettings = {...base.common, ...common}
		render(
			<QuickDownloadErrorAlert
				experience={buildProbeErrorExperience({error: RATE_LIMIT, commonSettings})}
				message={{kind: 'text', text: 'Too many requests'}}
				url={URL}
				onEnableCookiesAndRetry={vi.fn()}
				onOpenCookiesSettings={vi.fn()}
				onSignInWithExplore={vi.fn()}
				onSignInWithExploreThenRetry={vi.fn()}
				onRetryWithExploreSignIn={vi.fn()}
				onRetry={onRetry}
			/>
		)
		return {onRetry}
	}

	it.each(COOKIE_MODES)('gives no cookie advice and replaces the immediate Retry (%o)', async common => {
		useAppStore.setState({siteCooldowns: [cooldown()]})
		const {onRetry} = renderAlert(common)

		expectNoCookieAdvice()
		expect(screen.queryByTestId('quick-download-retry')).not.toBeInTheDocument()
		expect(screen.getByTestId('rate-limit-notice')).toHaveAttribute('data-density', 'compact')
		fireEvent.click(screen.getByTestId('rate-limit-try-now'))
		await waitFor(() => expect(onRetry).toHaveBeenCalledOnce())
		expect(window.appApi.siteRequests.tryNow).toHaveBeenCalledWith('youtube')
	})
})
