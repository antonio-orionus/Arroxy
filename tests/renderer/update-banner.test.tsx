import {render, renderHook, screen, fireEvent, act} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vite-plus/test'
import {UpdateBanner} from '@renderer/components/system/UpdateBanner.js'
import {resolveAction, resolveDownloadUrl} from '@renderer/components/system/updateBannerAction.js'
import {useUpdateChannel} from '@renderer/components/system/useUpdateChannel.js'
import {WEBSITE_URL} from '@shared/constants.js'
import type {UpdateAvailablePayload} from '@shared/types.js'

function makeInfo(overrides: Partial<UpdateAvailablePayload> = {}): UpdateAvailablePayload {
	return {version: '1.2.0', currentVersion: '0.0.1', installChannel: 'direct', homebrewAvailable: false, ...overrides}
}

describe('resolveAction', () => {
	it('scoop → copy-only command regardless of platform', () => {
		expect(resolveAction('scoop', 'win32')).toEqual({kind: 'command', cmd: 'scoop update arroxy', runnable: false})
		expect(resolveAction('scoop', 'darwin')).toEqual({kind: 'command', cmd: 'scoop update arroxy', runnable: false})
	})

	// Homebrew is the one package manager the app can drive itself: replacing
	// the .app bundle of a running macOS app is safe, then the app relaunches.
	it('homebrew → runnable command regardless of platform', () => {
		expect(resolveAction('homebrew', 'darwin')).toEqual({kind: 'command', cmd: 'brew upgrade --cask antonio-orionus/arroxy/arroxy', runnable: true})
		expect(resolveAction('homebrew', 'linux')).toEqual({kind: 'command', cmd: 'brew upgrade --cask antonio-orionus/arroxy/arroxy', runnable: true})
	})

	// `brew install --cask --adopt` cannot work here: adopt demands the installed
	// app be identical to the cask's, and an update is by definition pending.
	// --force overwrites the old bundle and registers the cask in one go. The cask
	// lives in Arroxy's own tap, which a DMG user has not tapped: only the fully
	// qualified name makes Homebrew tap it on the fly (the short name would fail
	// with "No Cask with this name exists").
	it('direct on darwin with Homebrew present → download plus a runnable force-install command', () => {
		expect(resolveAction('direct', 'darwin', true)).toEqual({kind: 'download', homebrewCommand: 'brew install --cask --force antonio-orionus/arroxy/arroxy'})
	})

	it('direct on darwin without Homebrew → plain download', () => {
		expect(resolveAction('direct', 'darwin', false)).toEqual({kind: 'download'})
		expect(resolveAction('direct', 'darwin')).toEqual({kind: 'download'})
	})

	it('Homebrew presence changes nothing off macOS', () => {
		expect(resolveAction('direct', 'linux', true)).toEqual({kind: 'install'})
		expect(resolveAction('direct', 'win32', true)).toEqual({kind: 'install'})
		expect(resolveAction('portable', 'win32', true)).toEqual({kind: 'download'})
	})

	it('winget → install regardless of platform', () => {
		expect(resolveAction('winget', 'win32')).toEqual({kind: 'install'})
		expect(resolveAction('winget', 'darwin')).toEqual({kind: 'install'})
	})

	it('direct → install on linux/win32, download on darwin', () => {
		expect(resolveAction('direct', 'linux')).toEqual({kind: 'install'})
		expect(resolveAction('direct', 'win32')).toEqual({kind: 'install'})
		expect(resolveAction('direct', 'darwin')).toEqual({kind: 'download'})
	})

	// An AppImage is the one Linux package electron-updater can replace itself.
	it('appimage → install', () => {
		expect(resolveAction('appimage', 'linux')).toEqual({kind: 'install'})
	})

	// electron-updater is inactive outside an AppImage, so the tarball install is
	// told to fetch the new archive itself.
	it('tarball → download', () => {
		expect(resolveAction('tarball', 'linux')).toEqual({kind: 'download'})
	})

	it('portable → download (NSIS install would clobber the portable layout)', () => {
		expect(resolveAction('portable', 'win32')).toEqual({kind: 'download'})
	})

	// Flatpak installs update from Arroxy's Flatpak repo; the app cannot replace
	// its own sandboxed files, so the banner hands the user the command.
	it('flatpak → copy-command for flatpak update', () => {
		expect(resolveAction('flatpak', 'linux')).toEqual({kind: 'command', cmd: 'flatpak update io.github.antonio_orionus.Arroxy', runnable: false})
	})
})

describe('resolveDownloadUrl', () => {
	// The release page of the announced version, not /releases/latest: GitHub
	// resolves that to the newest stable, which is older than a beta's update.
	it('sends a tarball install to the GitHub release of the announced version', () => {
		expect(resolveDownloadUrl(makeInfo({installChannel: 'tarball', version: '0.7.0'}))).toBe('https://github.com/antonio-orionus/Arroxy/releases/tag/v0.7.0')
		expect(resolveDownloadUrl(makeInfo({installChannel: 'tarball', version: '0.7.0-beta.2'}))).toBe('https://github.com/antonio-orionus/Arroxy/releases/tag/v0.7.0-beta.2')
	})

	it('sends every other download to the website', () => {
		expect(resolveDownloadUrl(makeInfo({installChannel: 'portable'}))).toBe(WEBSITE_URL)
		expect(resolveDownloadUrl(makeInfo({installChannel: 'direct'}))).toBe(WEBSITE_URL)
	})
})

describe('useUpdateChannel', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
	})

	function stubAppApi(): {announce: (info: UpdateAvailablePayload) => void; openExternal: ReturnType<typeof vi.fn>} {
		let listener: ((info: UpdateAvailablePayload) => void) | undefined
		const openExternal = vi.fn().mockResolvedValue(undefined)
		vi.stubGlobal('appApi', {...window.appApi, updater: {...window.appApi?.updater, onUpdateAvailable: (fn: (info: UpdateAvailablePayload) => void) => ((listener = fn), () => undefined), install: vi.fn()}, shell: {...window.appApi?.shell, openExternal}})
		return {announce: info => act(() => listener?.(info)), openExternal}
	}

	it('opens the announced release for a tarball install and closes the banner', () => {
		const api = stubAppApi()
		const {result} = renderHook(() => useUpdateChannel())
		api.announce(makeInfo({installChannel: 'tarball', version: '0.7.0'}))

		act(() => result.current.download())

		expect(api.openExternal).toHaveBeenCalledWith('https://github.com/antonio-orionus/Arroxy/releases/tag/v0.7.0')
		expect(result.current.info).toBeNull()
	})

	it('opens the website for a portable install', () => {
		const api = stubAppApi()
		const {result} = renderHook(() => useUpdateChannel())
		api.announce(makeInfo({installChannel: 'portable'}))

		act(() => result.current.download())

		expect(api.openExternal).toHaveBeenCalledWith(WEBSITE_URL)
	})
})

describe('UpdateBanner', () => {
	beforeEach(() => {
		window.platform = 'linux'
		Object.defineProperty(navigator, 'clipboard', {writable: true, configurable: true, value: {writeText: vi.fn().mockResolvedValue(undefined)}})
	})

	afterEach(() => {
		vi.useRealTimers()
		vi.restoreAllMocks()
	})

	it('renders both version numbers', () => {
		render(<UpdateBanner info={makeInfo()} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 1.2.0 is available — you have 0.0.1.')
	})

	it('shows Install & Restart for direct channel on linux', () => {
		window.platform = 'linux'
		render(<UpdateBanner info={makeInfo({installChannel: 'direct'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByRole('button', {name: 'Install & Restart'})).toBeInTheDocument()
		expect(screen.queryByText('Download ↗')).not.toBeInTheDocument()
	})

	it('shows manual DMG copy and Download DMG for direct channel on darwin', () => {
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'direct'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 1.2.0 is available — download the new DMG.')
		expect(screen.getByRole('button', {name: 'Download DMG ↗'})).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: 'Install & Restart'})).not.toBeInTheDocument()
	})

	it('offers to move a DMG install to Homebrew when brew is on the Mac, keeping Download DMG', () => {
		window.platform = 'darwin'
		const onInstall = vi.fn()
		const onDownload = vi.fn()
		render(<UpdateBanner info={makeInfo({installChannel: 'direct', homebrewAvailable: true})} installing={false} installError={null} onInstall={onInstall} onDownload={onDownload} onDismiss={vi.fn()} />)

		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 1.2.0 is available — download the DMG or switch to Homebrew.')
		expect(screen.getByTestId('update-command')).toHaveTextContent('brew install --cask --force antonio-orionus/arroxy/arroxy')
		expect(screen.getByRole('button', {name: /Copy command/i})).toBeInTheDocument()

		fireEvent.click(screen.getByRole('button', {name: 'Run & Restart'}))
		expect(onInstall).toHaveBeenCalledOnce()
		fireEvent.click(screen.getByRole('button', {name: 'Download DMG ↗'}))
		expect(onDownload).toHaveBeenCalledOnce()
	})

	it('copies the force-install command for a DMG install', async () => {
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'direct', homebrewAvailable: true})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: /Copy command/i}))
		})

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith('brew install --cask --force antonio-orionus/arroxy/arroxy')
	})

	it('shows no Homebrew controls for a DMG install without brew', () => {
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'direct', homebrewAvailable: false})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		expect(screen.queryByTestId('update-command')).not.toBeInTheDocument()
		expect(screen.queryByRole('button', {name: 'Run & Restart'})).not.toBeInTheDocument()
		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('download the new DMG.')
	})

	it('shows manual build copy for portable channel', () => {
		window.platform = 'win32'
		render(<UpdateBanner info={makeInfo({installChannel: 'portable'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 1.2.0 is available — download the new build.')
		expect(screen.getByRole('button', {name: 'Download ↗'})).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: 'Install & Restart'})).not.toBeInTheDocument()
	})

	it('shows Install & Restart for winget channel regardless of platform', () => {
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'winget'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByRole('button', {name: 'Install & Restart'})).toBeInTheDocument()
	})

	it('renders scoop command + copy button; clipboard receives the command', async () => {
		window.platform = 'win32'
		const onDismiss = vi.fn()
		render(<UpdateBanner info={makeInfo({installChannel: 'scoop'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={onDismiss} />)
		expect(screen.getByTestId('update-command')).toHaveTextContent('scoop update arroxy')

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: /Copy command/i}))
		})

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith('scoop update arroxy')
		expect(screen.getByTestId('update-banner')).toBeInTheDocument()
		expect(onDismiss).not.toHaveBeenCalled()
	})

	it('renders homebrew command + copy button; clipboard receives the command', async () => {
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'homebrew'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByTestId('update-banner-message')).toHaveTextContent('Arroxy 1.2.0 is available — update with Homebrew.')
		expect(screen.getByTestId('update-command')).toHaveTextContent('brew upgrade --cask antonio-orionus/arroxy/arroxy')

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: /Copy command/i}))
		})

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith('brew upgrade --cask antonio-orionus/arroxy/arroxy')
	})

	it('offers Run & Restart next to Copy for homebrew; clicking it calls onInstall', () => {
		window.platform = 'darwin'
		const onInstall = vi.fn()
		render(<UpdateBanner info={makeInfo({installChannel: 'homebrew'})} installing={false} installError={null} onInstall={onInstall} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		expect(screen.getByRole('button', {name: /Copy command/i})).toBeInTheDocument()
		fireEvent.click(screen.getByRole('button', {name: 'Run & Restart'}))

		expect(onInstall).toHaveBeenCalledOnce()
	})

	it('disables the homebrew Run button and shows Upgrading… while the upgrade runs', () => {
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'homebrew'})} installing={true} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		const btn = screen.getByRole('button', {name: /Upgrading/})
		expect(btn).toBeDisabled()
		expect(btn).toHaveTextContent('Upgrading…')
	})

	it('keeps the homebrew command visible and offers Retry after a failed upgrade', () => {
		window.platform = 'darwin'
		const onInstall = vi.fn()
		render(<UpdateBanner info={makeInfo({installChannel: 'homebrew'})} installing={false} installError={'Homebrew was not found.'} onInstall={onInstall} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		expect(screen.getByTestId('update-banner-message').textContent).toMatch(/Update failed.*Homebrew was not found/)
		expect(screen.getByTestId('update-command')).toHaveTextContent('brew upgrade --cask antonio-orionus/arroxy/arroxy')
		fireEvent.click(screen.getByRole('button', {name: 'Retry'}))
		expect(onInstall).toHaveBeenCalledOnce()
	})

	it.each(['scoop', 'flatpak'] as const)('does not offer a Run button for %s (copy only)', channel => {
		window.platform = 'linux'
		render(<UpdateBanner info={makeInfo({installChannel: channel})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		expect(screen.getByRole('button', {name: /Copy command/i})).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: 'Run & Restart'})).not.toBeInTheDocument()
	})

	it('copy button swaps icon to CopyCheck for ~2 s, then reverts', async () => {
		vi.useFakeTimers()
		window.platform = 'darwin'
		render(<UpdateBanner info={makeInfo({installChannel: 'homebrew'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)

		expect(screen.getByRole('button', {name: /Copy command/i})).toBeInTheDocument()

		await act(async () => {
			fireEvent.click(screen.getByRole('button', {name: /Copy command/i}))
		})

		expect(screen.getByRole('button', {name: /Copied command/i})).toBeInTheDocument()

		await act(async () => {
			vi.advanceTimersByTime(2_000)
		})

		expect(screen.getByRole('button', {name: /Copy command/i})).toBeInTheDocument()
		expect(screen.queryByRole('button', {name: /Copied command/i})).not.toBeInTheDocument()
	})

	it('disables Install & Restart and shows Downloading… while installing', () => {
		render(<UpdateBanner info={makeInfo()} installing={true} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		const btn = screen.getByRole('button', {name: /Downloading/})
		expect(btn).toBeDisabled()
		expect(btn).toHaveTextContent('Downloading…')
	})

	it('calls onInstall when Install & Restart is clicked', () => {
		const onInstall = vi.fn()
		render(<UpdateBanner info={makeInfo()} installing={false} installError={null} onInstall={onInstall} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		fireEvent.click(screen.getByRole('button', {name: 'Install & Restart'}))
		expect(onInstall).toHaveBeenCalledOnce()
	})

	it('calls onDownload when Download ↗ is clicked', () => {
		window.platform = 'darwin'
		const onDownload = vi.fn()
		render(<UpdateBanner info={makeInfo({installChannel: 'direct'})} installing={false} installError={null} onInstall={vi.fn()} onDownload={onDownload} onDismiss={vi.fn()} />)
		fireEvent.click(screen.getByRole('button', {name: 'Download DMG ↗'}))
		expect(onDownload).toHaveBeenCalledOnce()
	})

	it('shows installFailed error message + retry button when installError is set', () => {
		render(<UpdateBanner info={makeInfo()} installing={false} installError={'network down'} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByTestId('update-banner-message').textContent).toMatch(/Update failed.*network down/)
		// Button label switches from "Install & Restart" to "Retry" while in error state.
		expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument()
	})

	it('calls onInstall when Retry is clicked after a failure', () => {
		const onInstall = vi.fn()
		render(<UpdateBanner info={makeInfo()} installing={false} installError={'checksum mismatch'} onInstall={onInstall} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		fireEvent.click(screen.getByRole('button', {name: 'Retry'}))
		expect(onInstall).toHaveBeenCalledOnce()
	})

	it('calls onDismiss when × is clicked', () => {
		const onDismiss = vi.fn()
		render(<UpdateBanner info={makeInfo()} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={onDismiss} />)
		fireEvent.click(screen.getByRole('button', {name: 'Dismiss update banner'}))
		expect(onDismiss).toHaveBeenCalledOnce()
	})

	it('has the correct test id for integration targeting', () => {
		render(<UpdateBanner info={makeInfo()} installing={false} installError={null} onInstall={vi.fn()} onDownload={vi.fn()} onDismiss={vi.fn()} />)
		expect(screen.getByTestId('update-banner')).toBeInTheDocument()
	})
})
