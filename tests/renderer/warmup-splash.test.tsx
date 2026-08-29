// @vitest-environment jsdom
import {act, fireEvent, render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import type {DependencyDiagnostic, DependencyId, WarmupProgressEvent} from '@shared/types.js'
import {WarmupSplash} from '@renderer/components/system/WarmupSplash.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

const failedYtDlpDiagnostic: DependencyDiagnostic = {
	id: 'yt-dlp',
	state: 'failed',
	source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.test/yt-dlp'},
	resolvedPath: null,
	failure: {kind: 'download_failed', message: 'download failed'},
	attempts: [{source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.test/yt-dlp'}, failure: {kind: 'download_failed', message: 'download failed'}}]
}

function renderBlockedSplash(): void {
	render(<WarmupSplash initialized warmupBlocking={['yt-dlp']} warmupDiagnostics={{'yt-dlp': failedYtDlpDiagnostic} as Record<DependencyId, DependencyDiagnostic>} warmupProgress={null} showGreeting={false} />)
}

describe('WarmupSplash verification phase', () => {
	// Before this, only 'downloading' rendered anything concrete. A probe that
	// outlived its download left the splash frozen on "Preparing downloads…", so
	// a resolver walking its fallback list read to the user as a restart loop:
	// bar, silence, bar again.
	it('names the binary it is checking instead of going quiet', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing'} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

		expect(screen.getByTestId('splash-verifying')).toHaveTextContent('Checking yt-dlp')
	})

	it('lets a real download keep the foreground when both are in flight', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 1024 * 1024, totalBytes: 4 * 1024 * 1024} satisfies WarmupProgressEvent, ffmpeg: {binary: 'ffmpeg', phase: 'probing'} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Downloading yt-dlp')
		expect(screen.queryByTestId('splash-verifying')).toBeNull()
	})

	// A first check normally runs ~15s, and explaining that up front reads as noise
	// while the thing is visibly working. The message is for a wait that has
	// stopped being ordinary, so it stays hidden well past the normal duration.
	it('stays quiet through a first check of ordinary length', () => {
		vi.useFakeTimers()
		try {
			const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing', firstCheck: true} satisfies WarmupProgressEvent}
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

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
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

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
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

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
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)
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
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} onCancel={onCancel} />)

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

	// A cold start is ~22s of legitimate work on fast hardware. Counted from mount
	// the offer would fire mid-download; counted from the last advance it cannot,
	// because bytes keep arriving.
	it('does not offer a way out while bytes are still arriving', () => {
		vi.useFakeTimers()
		try {
			const onCancel = vi.fn()
			const at = (bytes: number) => ({'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: bytes, totalBytes: 40_000_000} satisfies WarmupProgressEvent})
			const {rerender} = render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={at(1_000_000)} showGreeting={false} onCancel={onCancel} />)

			for (let mb = 2; mb <= 6; mb++) {
				act(() => {
					vi.advanceTimersByTime(50_000)
				})
				rerender(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={at(mb * 1_000_000)} showGreeting={false} onCancel={onCancel} />)
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
		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveStyle({pointerEvents: 'auto'})
	})

	it('labels idle dependency warmup as preparing downloads', () => {
		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Preparing downloads')
		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('Starting Arroxy')
	})

	it('keeps concrete binary download progress and byte counts', () => {
		const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'downloading', bytesDownloaded: 3 * 1024 * 1024, totalBytes: 12 * 1024 * 1024} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Downloading yt-dlp')
		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('3.0 MB / 12.0 MB')
		expect(document.querySelector('.splash-progress-bar')).toHaveStyle({width: '25%'})
	})

	it('does not label post-download extraction as a stuck full download', () => {
		const warmupProgress = {ffmpeg: {binary: 'ffmpeg', phase: 'extracting'} satisfies WarmupProgressEvent}

		render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('Downloading ffmpeg')
		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('MB /')
		// The bar is back, but indeterminate — motion without a completion claim,
		// which is the opposite of the stuck full bar this test was written for.
		expect(document.querySelector('.splash-progress-bar')).toHaveClass('splash-progress-bar--indeterminate')
		expect(document.querySelector('.splash-progress-bar')).not.toHaveStyle({width: '100%'})
	})

	it('shows the welcome-back greeting only when requested', () => {
		const {rerender} = render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)

		expect(screen.queryByTestId('splash-greeting')).not.toBeInTheDocument()

		rerender(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting />)

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
			render(<WarmupSplash initialized={true} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)

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
