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

	it('explains the wait once checking has run long enough to look like a hang', () => {
		vi.useFakeTimers()
		try {
			const warmupProgress = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing'} satisfies WarmupProgressEvent}
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={warmupProgress} showGreeting={false} />)

			expect(screen.queryByTestId('splash-verify-slow')).toBeNull()
			act(() => {
				vi.advanceTimersByTime(6000)
			})

			expect(screen.getByTestId('splash-verify-slow')).toHaveTextContent('the first time after an update')
		} finally {
			vi.useRealTimers()
		}
	})

	// Resolving yt-dlp probes several candidates in a row, all reporting binary
	// 'yt-dlp'. Keyed on the id alone, a slow managed probe left the hint armed and
	// the next candidate — a Homebrew yt-dlp answering in milliseconds — flashed it
	// on screen before it had waited for anything.
	it('makes each candidate earn the hint on its own', () => {
		vi.useFakeTimers()
		try {
			const managed = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing', source: {kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://example.test/yt-dlp'}} satisfies WarmupProgressEvent}
			const onPath = {'yt-dlp': {binary: 'yt-dlp', phase: 'probing', source: {kind: 'systemPath', path: '/opt/homebrew/bin/yt-dlp'}} satisfies WarmupProgressEvent}
			const {rerender} = render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={managed} showGreeting={false} />)
			act(() => {
				vi.advanceTimersByTime(6000)
			})
			expect(screen.getByTestId('splash-verify-slow')).toBeTruthy()

			rerender(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={onPath} showGreeting={false} />)

			expect(screen.queryByTestId('splash-verify-slow')).toBeNull()
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
				vi.advanceTimersByTime(11000)
			})

			expect(screen.queryByTestId('splash-cancel')).toBeNull()
		} finally {
			vi.useRealTimers()
		}
	})

	// WarmupService's own comment says the user "has no out without a Cancel
	// button". Cancelling lands on the repair panel, which can retry or point at
	// a manual binary.
	it('offers a way out once warmup has taken long enough to need one', () => {
		vi.useFakeTimers()
		try {
			const onCancel = vi.fn()
			render(<WarmupSplash initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} onCancel={onCancel} />)

			expect(screen.queryByTestId('splash-cancel')).toBeNull()
			act(() => {
				vi.advanceTimersByTime(11000)
			})
			fireEvent.click(screen.getByTestId('splash-cancel'))

			expect(onCancel).toHaveBeenCalledTimes(1)
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
})
