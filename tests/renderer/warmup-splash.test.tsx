// @vitest-environment jsdom
import {act, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import type {DependencyDiagnostic, DependencyId, WarmupProgressEvent} from '@shared/types.js'
import {WarmupSplash} from '@renderer/components/system/WarmupSplash.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {EMPTY_WARMUP_DOWNLOADS, trackWarmupDownloads, type WarmupDownloads} from '@renderer/store/warmupDownloads.js'

// What the store would hold after these events arrived.
function downloadsFor(progress: Partial<Record<DependencyId, WarmupProgressEvent>> | null): WarmupDownloads {
	return progress ? trackWarmupDownloads(EMPTY_WARMUP_DOWNLOADS, progress, 0) : EMPTY_WARMUP_DOWNLOADS
}

const failedYtDlpDiagnostic: DependencyDiagnostic = {
	id: 'yt-dlp',
	state: 'failed',
	source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.test/yt-dlp'},
	resolvedPath: null,
	failure: {kind: 'download_failed', message: 'download failed'},
	attempts: [{source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.test/yt-dlp'}, failure: {kind: 'download_failed', message: 'download failed'}}]
}

function renderBlockedSplash(): void {
	render(<WarmupSplash initialized warmupBlocking={['yt-dlp']} warmupDiagnostics={{'yt-dlp': failedYtDlpDiagnostic} as Record<DependencyId, DependencyDiagnostic>} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} />)
}

describe('WarmupSplash verification phase', () => {
	// Before this, only 'downloading' rendered anything concrete. A probe that
	// outlived its download left the splash frozen on "Preparing downloads…", so
	// a resolver walking its fallback list read to the user as a restart loop:
	// bar, silence, bar again.
	it('names the binary it is checking instead of going quiet', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing'} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

		expect(screen.getByTestId('splash-verifying')).toHaveTextContent('Checking yt-dlp')
	})

	it('lets a real download keep the foreground when a check runs alongside it', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 1024 * 1024, totalBytes: 4 * 1024 * 1024} satisfies WarmupProgressEvent, ffmpeg: {binary: 'ffmpeg', phase: 'probing'} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

		expect(screen.getByTestId('splash-setup-title')).toHaveTextContent('First-time setup')
		expect(screen.getByTestId('splash-setup')).toBeInTheDocument()
		expect(screen.queryByTestId('splash-verifying')).toBeNull()
	})

	// A first check normally runs ~15s, and explaining that up front reads as noise
	// while the thing is visibly working. The message is for a wait that has
	// stopped being ordinary, so it stays hidden well past the normal duration.
	it('stays quiet through a first check of ordinary length', () => {
		vi.useFakeTimers()
		try {
			const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing', firstCheck: true} satisfies WarmupProgressEvent}
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

			// Longer than every cold probe measured (14.5s–15.9s).
			act(() => {
				vi.advanceTimersByTime(20_000)
			})

			expect(screen.queryByTestId('splash-verify-firstcheck')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})

	it('explains a first check once it runs past any normal duration', () => {
		vi.useFakeTimers()
		try {
			const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing', firstCheck: true} satisfies WarmupProgressEvent}
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

			act(() => {
				vi.advanceTimersByTime(36_000)
			})

			expect(screen.getByTestId('splash-verify-firstcheck')).toHaveTextContent('First check of this version')
		} finally {
			vi.useRealTimers()
		}
	})

	// A reused verdict is a local file read that answers immediately. Explaining a
	// wait that is not going to happen is how the old threshold-based hint flashed
	// on screen for a Homebrew yt-dlp that answered in milliseconds.
	it('never arms the hint when the verdict is reused rather than re-probed', () => {
		vi.useFakeTimers()
		try {
			const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing', firstCheck: false} satisfies WarmupProgressEvent}
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

			act(() => {
				vi.advanceTimersByTime(120_000)
			})

			expect(screen.queryByTestId('splash-verify-firstcheck')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})

	// browser-mock and the scenario gallery render the splash without a handler.
	// Offering a button that cannot do anything is worse than offering none.
	it('offers no way out when there is nothing wired to cancel', () => {
		vi.useFakeTimers()
		try {
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} />)
			act(() => {
				vi.advanceTimersByTime(61000)
			})

			expect(screen.queryByTestId('splash-cancel')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})

	// Cancelling lands on the repair panel, which can point at a manual binary or
	// install one — the fastest route to a working app when the managed download
	// cannot succeed, not a way to abandon setup.
	it('offers a way out once progress has stopped for long enough', () => {
		vi.useFakeTimers()
		try {
			const onCancel = vi.fn()
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} onCancel={onCancel} />)

			expect(screen.queryByTestId('splash-cancel')).toBeNull()
			act(() => {
				vi.advanceTimersByTime(61000)
			})
			fireEvent.click(screen.getByTestId('splash-cancel'))

			expect(onCancel).toHaveBeenCalledTimes(1)
		} finally {
			vi.useRealTimers()
		}
	})

	// A download that keeps moving never stops for 60s, so the no-progress offer
	// never came: someone at 0.4 Mbps waited 15 minutes with no way out.
	function slowRender(onCancel: () => void, {downloaded, total, bytesPerSecond}: {downloaded: number; total: number; bytesPerSecond: number}): void {
		const progress = {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: downloaded, totalBytes: total} satisfies WarmupProgressEvent}
		const downloads: WarmupDownloads = {
			ledger: downloadsFor(progress).ledger,
			samples: [
				{at: 0, bytes: downloaded - 4 * bytesPerSecond},
				{at: 4000, bytes: downloaded}
			]
		}
		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={progress} warmupDownloads={downloads} showGreeting={false} onCancel={onCancel} />)
	}

	it('offers a way out once the time left has stayed above five minutes for 20 s', () => {
		vi.useFakeTimers()
		try {
			// 2 Mbps (not slow by speed), 100 MB left: about 400 s.
			slowRender(vi.fn(), {downloaded: 1_000_000, total: 101_000_000, bytesPerSecond: 250_000})
			act(() => {
				vi.advanceTimersByTime(19_000)
			})
			expect(screen.queryByTestId('splash-cancel')).toBeNull()
			act(() => {
				vi.advanceTimersByTime(2_000)
			})
			expect(screen.getByTestId('splash-cancel')).toBeInTheDocument()
		} finally {
			vi.useRealTimers()
		}
	})

	it('offers a way out once the speed has stayed under 1 Mbps for 30 s', () => {
		vi.useFakeTimers()
		try {
			// 0.8 Mbps with 36 s left: slow by speed only.
			slowRender(vi.fn(), {downloaded: 400_000, total: 4_000_000, bytesPerSecond: 100_000})
			act(() => {
				vi.advanceTimersByTime(29_000)
			})
			expect(screen.queryByTestId('splash-cancel')).toBeNull()
			act(() => {
				vi.advanceTimersByTime(2_000)
			})
			expect(screen.getByTestId('splash-cancel')).toBeInTheDocument()
		} finally {
			vi.useRealTimers()
		}
	})

	it('does not offer a way out for a fast download with little left', () => {
		vi.useFakeTimers()
		try {
			slowRender(vi.fn(), {downloaded: 10_000_000, total: 20_000_000, bytesPerSecond: 2_500_000})
			act(() => {
				vi.advanceTimersByTime(45_000)
			})
			expect(screen.queryByTestId('splash-cancel')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})

	// A cold start is ~22s of legitimate work on fast hardware. Counted from mount
	// the offer would fire mid-download; counted from the last advance it cannot,
	// because bytes keep arriving.
	it('does not offer a way out while bytes are still arriving', () => {
		vi.useFakeTimers()
		try {
			const onCancel = vi.fn()
			const at = (bytes: number) => ({'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: bytes, totalBytes: 40_000_000} satisfies WarmupProgressEvent})
			const {rerender} = render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={at(1_000_000)} warmupDownloads={downloadsFor(at(1_000_000))} showGreeting={false} onCancel={onCancel} />)

			for (let mb = 2; mb <= 6; mb++) {
				act(() => {
					vi.advanceTimersByTime(50_000)
				})
				rerender(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={at(mb * 1_000_000)} warmupDownloads={downloadsFor(at(mb * 1_000_000))} showGreeting={false} onCancel={onCancel} />)
			}

			// 250s elapsed, never 60s without an advance.
			expect(screen.queryByTestId('splash-cancel')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})
})

describe('WarmupSplash', () => {
	afterEach(() => {
		useAppStore.setState({warmupRunning: false, warmupCancellable: false, cancelWarmup: vi.fn()})
	})

	it('blocks pointer events while warmup overlay is visible', () => {
		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveStyle({pointerEvents: 'auto'})
	})

	it('labels idle dependency warmup as preparing downloads', () => {
		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Preparing downloads')
		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('Starting Arroxy')
	})

	// One heading, one bar, one line: the byte counts and the stage line said
	// what the bar and the heading already say.
	it('turns a first download into the setup view with one heading and one bar', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 3 * 1024 * 1024, totalBytes: 12 * 1024 * 1024} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

		expect(screen.getByTestId('splash-setup-title')).toHaveTextContent('First-time setup')
		expect(screen.getByRole('progressbar', {name: 'First-time setup'})).toHaveAttribute('aria-valuenow', '25')
		expect(document.querySelector('.splash-setup-bar [data-slot="progress-indicator"]')).toHaveStyle({width: '25%'})
		const overlay = screen.getByTestId('splash-overlay')
		expect(overlay).not.toHaveTextContent('MiB')
		expect(overlay).not.toHaveTextContent('Downloading the download engine')
		// "This happens once" told a waiting user nothing they could act on.
		expect(overlay).not.toHaveTextContent('This happens once')
	})

	it('keeps the setup bar indeterminate until the first bytes arrive', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 0, totalBytes: 12 * 1024 * 1024} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

		expect(screen.getByTestId('splash-setup')).toHaveAttribute('data-stage', 'connecting')
		expect(screen.getByTestId('splash-setup-status')).toHaveTextContent('Connecting…')
		expect(screen.getByRole('progressbar', {name: 'First-time setup'})).not.toHaveAttribute('aria-valuenow')
		expect(document.querySelector('.splash-setup-bar [data-slot="progress-indicator"]')).toHaveAttribute('data-indeterminate')
	})

	// A returning user reads it as an update of one part, or of both, never as a
	// fresh install; tool names are for repair and manual setup.
	it.each([
		['the media tools', {ffmpeg: {binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 21 * 1024 * 1024, totalBytes: 42 * 1024 * 1024}}, 'Updating the media tools'],
		['the download engine', {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 9 * 1024 * 1024, totalBytes: 18 * 1024 * 1024}}, 'Updating the download engine'],
		['both tools', {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 9 * 1024 * 1024, totalBytes: 18 * 1024 * 1024}, ffmpeg: {binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 21 * 1024 * 1024, totalBytes: 42 * 1024 * 1024}}, "Updating Arroxy's tools"]
	] satisfies Array<[string, Partial<Record<DependencyId, WarmupProgressEvent>>, string]>)('tells a returning user it is updating %s', (_what, warmupProgress, heading) => {
		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting />)

		expect(screen.getByTestId('splash-setup-title')).toHaveTextContent(heading)
		const overlay = screen.getByTestId('splash-overlay')
		expect(overlay).not.toHaveTextContent('This happens once')
		expect(overlay).not.toHaveTextContent('FFmpeg')
		expect(overlay).not.toHaveTextContent('yt-dlp')
	})

	// The name stays under the mascot, and the setup heading takes the
	// greeting's place in the same slot, so the change into the setup screen
	// moves nothing above the bar.
	it('puts the setup heading in the slot the greeting held, under the name', () => {
		const warmupProgress = {ffmpeg: {binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 21 * 1024 * 1024, totalBytes: 42 * 1024 * 1024} satisfies WarmupProgressEvent}
		const {rerender} = render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting />)
		const slot = screen.getByTestId('splash-head')
		expect(slot).toHaveAttribute('data-setup', 'false')
		expect(screen.getByTestId('splash-greeting')).not.toHaveAttribute('aria-hidden')
		expect(screen.getByTestId('splash-setup-title')).toHaveAttribute('aria-hidden', 'true')

		rerender(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting />)

		expect(screen.getByTestId('splash-head')).toBe(slot)
		expect(slot).toHaveAttribute('data-setup', 'true')
		expect(screen.getByTestId('splash-greeting')).toHaveAttribute('aria-hidden', 'true')
		expect(screen.getByTestId('splash-setup-title')).not.toHaveAttribute('aria-hidden')
		expect(screen.getByText('Arroxy')).toBeVisible()
	})

	it('says the time left once the store has measured a stable rate', () => {
		const event = (bytes: number): WarmupProgressEvent => ({binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: bytes, totalBytes: 42 * 1024 * 1024})
		let downloads = EMPTY_WARMUP_DOWNLOADS
		downloads = trackWarmupDownloads(downloads, {ffmpeg: event(0)}, 0)
		downloads = trackWarmupDownloads(downloads, {ffmpeg: event(2 * 1024 * 1024)}, 6000)

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={{ffmpeg: event(2 * 1024 * 1024)}} warmupDownloads={downloads} showGreeting={false} />)

		// 40 MB left at 2 MB per 6 s is 120 s.
		expect(screen.getByTestId('splash-setup-status').textContent).toBe('about 2 min left')
	})

	it('leaves the status line empty until a time left can be promised', () => {
		const warmupProgress = {ffmpeg: {binary: 'ffmpeg', phase: 'downloading', bytesDownloaded: 2 * 1024 * 1024, totalBytes: 42 * 1024 * 1024} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

		expect(screen.getByTestId('splash-setup-status')).toBeEmptyDOMElement()
	})

	// With one download still waiting for its size, the bytes left leave that
	// download out, so a time left would promise far too little.
	it('holds back the time left while any running download has no size yet', () => {
		const engine = (bytes: number): WarmupProgressEvent => ({binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: bytes, totalBytes: 18 * 1024 * 1024})
		const media: WarmupProgressEvent = {binary: 'ffmpeg', phase: 'downloading'}
		let downloads = trackWarmupDownloads(EMPTY_WARMUP_DOWNLOADS, {'yt-dlp': engine(1024 * 1024), ffmpeg: media}, 0)
		downloads = trackWarmupDownloads(downloads, {'yt-dlp': engine(5 * 1024 * 1024), ffmpeg: media}, 6000)

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={{'yt-dlp': engine(5 * 1024 * 1024), ffmpeg: media}} warmupDownloads={downloads} showGreeting={false} />)

		expect(screen.getByRole('progressbar', {name: 'First-time setup'})).not.toHaveAttribute('aria-valuenow')
		expect(screen.getByTestId('splash-setup-status')).toBeEmptyDOMElement()
	})

	it.each([
		['the media tools unpacking', {binary: 'ffmpeg', phase: 'extracting'}, 'Unpacking the media tools'],
		['the download engine unpacking', {binary: 'yt-dlp', phase: 'extracting'}, 'Unpacking the download engine'],
		['checking', {binary: 'ffmpeg', phase: 'probing'}, 'Checking everything works']
	] satisfies Array<[string, WarmupProgressEvent, string]>)('says what happens once the download is over: %s', (_stage, after, line) => {
		const binary = after.binary
		let downloads = trackWarmupDownloads(EMPTY_WARMUP_DOWNLOADS, {[binary]: {binary, phase: 'downloading', bytesDownloaded: 18 * 1024 * 1024, totalBytes: 18 * 1024 * 1024}}, 0)
		downloads = trackWarmupDownloads(downloads, {[binary]: after}, 1000)

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={{[binary]: after}} warmupDownloads={downloads} showGreeting />)

		expect(screen.getByTestId('splash-setup-status')).toHaveTextContent(line)
	})

	it('does not label post-download extraction as a stuck full download', () => {
		const warmupProgress = {ffmpeg: {binary: 'ffmpeg', phase: 'extracting'} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} warmupDownloads={downloadsFor(warmupProgress)} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('Downloading')
		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('MB of')
		// The bar is back, but indeterminate — motion without a completion claim,
		// which is the opposite of the stuck full bar this test was written for.
		expect(document.querySelector('.splash-progress-bar')).toHaveClass('splash-progress-bar--indeterminate')
		expect(document.querySelector('.splash-progress-bar')).not.toHaveStyle({width: '100%'})
	})

	it('shows the welcome-back greeting only when requested', () => {
		const {rerender} = render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} />)

		expect(screen.queryByTestId('splash-greeting')).not.toBeInTheDocument()

		rerender(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting />)

		expect(screen.getByTestId('splash-greeting')).toBeInTheDocument()
	})

	it('does not show cancel during non-cancellable package-manager repair phases', () => {
		useAppStore.setState({warmupRunning: true, warmupCancellable: false})

		renderBlockedSplash()

		expect(screen.queryByRole('button', {name: /cancel/i})).not.toBeInTheDocument()
	})

	it('shows cancel during cancellable warmup phases', () => {
		useAppStore.setState({warmupRunning: true, warmupCancellable: true})

		renderBlockedSplash()

		expect(screen.getByRole('button', {name: /cancel/i})).toBeInTheDocument()
	})

	it('releases the splash 800ms after warmup finishes rather than holding a fixed three seconds', () => {
		vi.useFakeTimers()
		try {
			render(<WarmupSplash initialized={true} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} warmupDownloads={downloadsFor(null)} showGreeting={false} />)

			act(() => {
				vi.advanceTimersByTime(700)
			})
			expect(screen.getByTestId('splash-overlay')).toHaveAttribute('data-state', 'preparing')

			act(() => {
				vi.advanceTimersByTime(100)
			})
			expect(screen.getByTestId('splash-overlay')).toHaveAttribute('data-state', 'fading')
		} finally {
			vi.useRealTimers()
		}
	})
})
