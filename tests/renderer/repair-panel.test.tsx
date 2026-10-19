// @vitest-environment jsdom
import {fireEvent, render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it, vi} from 'vite-plus/test'
import type {DependencyDiagnostic, DependencyFailureKind, DependencyId} from '@shared/types.js'
import {RepairPanel} from '@renderer/components/system/RepairPanel.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

function failed(id: DependencyId, kind: DependencyFailureKind): DependencyDiagnostic {
	return {id, state: 'failed', source: {kind: 'managed', channel: 'default', provider: 'github', url: 'https://example.test'}, resolvedPath: null, failure: {kind, message: kind}, attempts: []}
}

const offline: Record<DependencyId, DependencyDiagnostic> = {'yt-dlp': failed('yt-dlp', 'download_failed'), ffmpeg: failed('ffmpeg', 'download_failed'), ffprobe: failed('ffprobe', 'download_failed')}
const ALL: DependencyId[] = ['yt-dlp', 'ffmpeg', 'ffprobe']

describe('RepairPanel', () => {
	afterEach(() => {
		useAppStore.setState({warmupRunning: false, warmupCancellable: false, warmupStopped: false})
	})

	// Found on the Windows VM: "Having trouble? Set it up manually" landed on
	// "Something went wrong during setup" with the manual section collapsed.
	it('treats a setup the user stopped as stopped, and opens manual setup', () => {
		useAppStore.setState({warmupStopped: true})

		render(<RepairPanel diagnostics={offline} blocking={ALL} />)

		expect(screen.getByTestId('repair-cause')).toHaveAttribute('data-cause', 'stopped')
		expect(screen.getByTestId('repair-cause')).toHaveTextContent('Setup stopped')
		expect(screen.getByTestId('repair-manual-ffmpeg')).toBeInTheDocument()
	})

	// Offline on a first launch used to show three near-identical cards, each
	// leading with "Choose executable". The fix for nearly everyone is Try again.
	it('explains a shared failure once and leads with Try again', () => {
		const repairWarmup = vi.fn(async () => undefined)
		useAppStore.setState({repairWarmup})

		render(<RepairPanel diagnostics={offline} blocking={ALL} />)

		expect(screen.getByTestId('repair-cause')).toHaveTextContent("Couldn't download what Arroxy needs")
		expect(screen.getByTestId('repair-cause')).toHaveTextContent('Download engine')
		expect(screen.getByTestId('repair-cause')).toHaveTextContent('Media tools')
		expect(screen.getByTestId('repair-cause')).not.toHaveTextContent('FFmpeg')
		expect(screen.getByTestId('repair-cause')).not.toHaveTextContent('yt-dlp')
		expect(screen.queryByTestId('repair-causes')).toBeNull()
		fireEvent.click(screen.getByTestId('repair-retry'))
		expect(repairWarmup).toHaveBeenCalledTimes(1)
	})

	it('keeps the manual tools out of the way until asked for', () => {
		render(<RepairPanel diagnostics={offline} blocking={ALL} />)

		expect(screen.queryByText('Choose executable')).toBeNull()

		fireEvent.click(screen.getByTestId('repair-manual-toggle'))

		expect(screen.getByTestId('repair-manual-yt-dlp')).toHaveTextContent('ARX-001')
		// FFmpeg and FFprobe are set up as a pair, so both are offered.
		expect(screen.getByTestId('repair-manual-ffmpeg')).toBeInTheDocument()
		expect(screen.getByTestId('repair-manual-ffprobe')).toBeInTheDocument()
		expect(screen.getAllByText('Choose executable')).toHaveLength(3)
	})

	describe('package managers', () => {
		const realPlatform = window.platform
		const realRuntime = window.runtimeInfo
		afterEach(() => {
			window.platform = realPlatform
			window.runtimeInfo = realRuntime
		})

		function openManual(): void {
			render(<RepairPanel diagnostics={offline} blocking={ALL} />)
			fireEvent.click(screen.getByTestId('repair-manual-toggle'))
		}

		// One install supplies both media tools, so the button belongs to the group.
		it('offers WinGet for the media tools on Windows and installs them as a pair', () => {
			window.platform = 'win32'
			const repairFfmpegWithPackageManager = vi.fn(async () => undefined)
			useAppStore.setState({repairFfmpegWithPackageManager})

			openManual()
			fireEvent.click(screen.getByTestId('repair-install-media'))

			expect(screen.getByTestId('repair-install-media')).toHaveTextContent('Install with WinGet')
			expect(repairFfmpegWithPackageManager).toHaveBeenCalledWith('winget')
			expect(screen.queryByTestId('repair-linux-hint')).toBeNull()
		})

		// Found on the Windows VM: a minutes-long WinGet install greyed out every
		// button and said nothing.
		it('says a package manager install is running', () => {
			window.platform = 'win32'
			useAppStore.setState({warmupRunning: true, packageInstall: 'winget'})

			render(<RepairPanel diagnostics={offline} blocking={ALL} />)

			expect(screen.getByTestId('repair-installing')).toHaveTextContent('Installing with WinGet')
			useAppStore.setState({warmupRunning: false, packageInstall: null})
		})

		it('offers Homebrew on macOS', () => {
			window.platform = 'darwin'

			openManual()

			expect(screen.getByTestId('repair-install-media')).toHaveTextContent('Install with Homebrew')
		})

		it('points Linux at its own package manager instead of a button', () => {
			window.platform = 'linux'
			window.runtimeInfo = {arch: 'x64', osVersion: 'test', installChannel: 'appimage'}

			openManual()

			expect(screen.queryByTestId('repair-install-media')).toBeNull()
			expect(screen.getByTestId('repair-linux-hint')).toHaveTextContent('package manager')
		})

		// A Flatpak cannot see what the host installs, so the hint would mislead.
		it('gives a Flatpak no package-manager hint', () => {
			window.platform = 'linux'
			window.runtimeInfo = {arch: 'x64', osVersion: 'test', installChannel: 'flatpak'}

			openManual()

			expect(screen.queryByTestId('repair-linux-hint')).toBeNull()
		})
	})

	it('gives each tool group its own line when the causes differ', () => {
		const mixed = {...offline, 'yt-dlp': failed('yt-dlp', 'blocked_or_quarantined')}

		render(<RepairPanel diagnostics={mixed} blocking={ALL} />)

		const causes = screen.getByTestId('repair-causes')
		expect(causes.querySelectorAll('[data-cause]')).toHaveLength(2)
		expect(causes).toHaveTextContent('Your antivirus blocked a tool')
		expect(causes).toHaveTextContent("Couldn't download what Arroxy needs")
	})
})
