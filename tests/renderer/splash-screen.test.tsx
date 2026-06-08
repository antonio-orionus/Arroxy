// @vitest-environment jsdom
import {render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vitest'
import type {DependencyDiagnostic, DependencyId} from '@shared/types.js'
import {SplashScreen} from '@renderer/components/system/SplashScreen.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

const failedYtDlpDiagnostic: DependencyDiagnostic = {
	id: 'yt-dlp',
	state: 'failed',
	source: {kind: 'managed', channel: 'nightly', url: 'https://example.test/yt-dlp'},
	resolvedPath: null,
	failure: {kind: 'download_failed', message: 'download failed'},
	attempts: [{source: {kind: 'managed', channel: 'nightly', url: 'https://example.test/yt-dlp'}, failure: {kind: 'download_failed', message: 'download failed'}}]
}

function renderBlockedSplash(): void {
	render(<SplashScreen initialized warmupBlocking={['yt-dlp']} warmupDiagnostics={{'yt-dlp': failedYtDlpDiagnostic} as Record<DependencyId, DependencyDiagnostic>} warmupProgress={null} showGreeting={false} />)
}

describe('SplashScreen', () => {
	afterEach(() => {
		useAppStore.setState({warmupRunning: false, warmupCancellable: false, cancelWarmup: vi.fn()})
	})

	it('blocks pointer events while warmup overlay is visible', () => {
		render(<SplashScreen initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)

		expect(screen.getByTestId('splash-overlay')).toHaveStyle({pointerEvents: 'auto'})
	})

	it('shows the welcome-back greeting only when requested', () => {
		const {rerender} = render(<SplashScreen initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting={false} />)

		expect(screen.queryByTestId('splash-greeting')).not.toBeInTheDocument()

		rerender(<SplashScreen initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} showGreeting />)

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
