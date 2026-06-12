// @vitest-environment jsdom
import {render, screen} from '@testing-library/react'
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

		expect(screen.getByTestId('splash-overlay')).toHaveTextContent('Preparing downloads')
		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('Downloading ffmpeg')
		expect(screen.getByTestId('splash-overlay')).not.toHaveTextContent('MB /')
		expect(document.querySelector('.splash-progress-bar')).not.toBeInTheDocument()
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
