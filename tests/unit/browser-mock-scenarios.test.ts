import {describe, expect, it, vi} from 'vitest'

import {applyScenarioWorkbenchState, buildScenarioAppApiState, bulkStressFixture, getScenario, mockStepForScenario, readScenarioIdFromUrl, readUrlParams, shouldMockEmptyPlaylistScopeReload, shouldShowBrowserMockStartupSplash, type ScenarioWorkbenchStore} from '@renderer/dev/browserMockScenarios.js'

describe('browser mock scenarios', () => {
	it('reads known scenario ids from URLs', () => {
		expect(readScenarioIdFromUrl(new URL('http://localhost:5173/?scenario=queue-running'))).toBe('queue-running')
		expect(readScenarioIdFromUrl(new URL('http://localhost:5173/?scenario=nope'))).toBeNull()
		expect(readScenarioIdFromUrl(new URL('http://localhost:5173/'))).toBeNull()
	})

	it('falls back to the default scenario for unknown ids', () => {
		expect(getScenario('single-normal').id).toBe('single-normal')
		expect(getScenario('playlist-normal').id).toBe('playlist-normal')
		expect(getScenario('playlist-scope-empty-reload').id).toBe('playlist-scope-empty-reload')
		expect(getScenario('probe-audio-only').id).toBe('probe-audio-only')
		expect(getScenario('not-real').id).toBe('default')
	})

	it('parses mock step params and rejects invalid step/scenario combinations', () => {
		expect(readUrlParams(new URL('http://localhost:5173/?scenario=single-normal&mockStep=confirm')).mockStep).toBe('confirm')
		expect(readUrlParams(new URL('http://localhost:5173/?scenario=single-normal&mockStep=nope')).mockStep).toBeNull()
		expect(readUrlParams(new URL('http://localhost:5173/')).mockStep).toBeNull()

		expect(mockStepForScenario(getScenario('single-normal'), 'subtitles')).toBe('subtitles')
		expect(mockStepForScenario(getScenario('single-normal'), 'playlistPresets')).toBeNull()
		expect(mockStepForScenario(getScenario('playlist-normal'), 'playlistPresets')).toBe('playlistPresets')
		expect(mockStepForScenario(getScenario('playlist-scope-empty-reload'), 'playlistItems')).toBe('playlistItems')
		expect(mockStepForScenario(getScenario('playlist-normal'), 'formats')).toBeNull()
	})

	it('builds playlist fixtures via ?playlist=n param', () => {
		const params99 = readUrlParams(new URL('http://localhost:5173/?playlist=99'))
		const params100 = readUrlParams(new URL('http://localhost:5173/?playlist=100'))
		const params101 = readUrlParams(new URL('http://localhost:5173/?playlist=101'))

		expect(params99.playlistCount).toBe(99)
		expect(params100.playlistCount).toBe(100)
		expect(params101.playlistCount).toBe(101)

		const under = buildScenarioAppApiState(getScenario('default'), params99)
		const capped = buildScenarioAppApiState(getScenario('default'), params100)
		const over = buildScenarioAppApiState(getScenario('default'), params101)

		if (under.probeResult?.kind !== 'playlist' || capped.probeResult?.kind !== 'playlist' || over.probeResult?.kind !== 'playlist') {
			throw new Error('expected playlist probe fixtures')
		}

		expect(under.probeResult.entries).toHaveLength(99)
		expect(capped.probeResult.entries).toHaveLength(100)
		expect(over.probeResult.entries).toHaveLength(101)
	})

	it('builds no-thumbnail playlist fixtures', () => {
		const state = buildScenarioAppApiState(getScenario('playlist-no-thumbnails'))
		if (state.probeResult?.kind !== 'playlist') throw new Error('expected playlist probe fixture')

		expect(state.probeResult.entries).toHaveLength(100)
		expect(state.probeResult.entries.every(entry => entry.thumbnail === '')).toBe(true)
	})

	it('builds normal screen preset fixtures', () => {
		const single = buildScenarioAppApiState(getScenario('single-normal'))
		expect(single.probeResult?.kind).toBe('video')
		if (single.probeResult?.kind !== 'video') throw new Error('expected video probe')
		expect(single.probeResult.extractor).toBe('youtube')
		expect(single.probeResult.formats.length).toBeGreaterThan(6)
		expect(Object.keys(single.probeResult.subtitles)).toContain('en')
		expect(Object.keys(single.probeResult.automaticCaptions)).toContain('en-orig')

		const playlist = buildScenarioAppApiState(getScenario('playlist-normal'))
		expect(playlist.probeResult?.kind).toBe('playlist')
		if (playlist.probeResult?.kind !== 'playlist') throw new Error('expected playlist probe')
		expect(playlist.probeResult.entries).toHaveLength(12)
		expect(playlist.probeResult.entries.every(entry => entry.thumbnail !== '')).toBe(true)
		expect(playlist.probeResult.entries.every(entry => entry.duration !== undefined)).toBe(true)

		const scopeEmptyReload = buildScenarioAppApiState(getScenario('playlist-scope-empty-reload'))
		expect(scopeEmptyReload.probeResult?.kind).toBe('playlist')
		if (scopeEmptyReload.probeResult?.kind !== 'playlist') throw new Error('expected playlist probe')
		expect(scopeEmptyReload.probeResult.entries).toHaveLength(12)
	})

	it('builds the bulk stress workbench fixture', () => {
		const fixture = bulkStressFixture()

		expect(getScenario('bulk-stress').kind).toBe('bulk')
		expect(fixture.entries).toHaveLength(50)
		expect(fixture.total).toBe(50)
		expect(fixture.completed).toBeGreaterThan(0)
		expect(fixture.entries.some(entry => entry.thumbnail === '')).toBe(true)
		expect(fixture.entries.some(entry => entry.duration === undefined)).toBe(true)
		expect(new Set(fixture.entries.map(entry => entry.title)).size).toBeLessThan(fixture.entries.length)
		expect(Object.values(fixture.metadataById)).toEqual(expect.arrayContaining(['pending', 'resolving', 'failed', 'done']))
	})

	it('applies scenario workbench state through one interface', async () => {
		const store: ScenarioWorkbenchStore = {reset: vi.fn(), setWizardUrl: vi.fn(), submitUrl: vi.fn().mockResolvedValue(undefined), quickDownload: vi.fn().mockResolvedValue(undefined), setState: vi.fn()}

		await applyScenarioWorkbenchState({scenario: getScenario('bulk-stress'), params: readUrlParams(new URL('http://localhost:5173/?scenario=bulk-stress')), store})

		expect(store.reset).toHaveBeenCalledOnce()
		const bulkPatch = vi.mocked(store.setState).mock.calls[0]?.[0]
		expect(bulkPatch).toMatchObject({wizardMode: 'bulk', wizardStep: 'playlistItems', bulkMetadataTotal: 50})

		vi.mocked(store.setWizardUrl).mockClear()
		vi.mocked(store.submitUrl).mockClear()
		vi.mocked(store.setState).mockClear()

		await applyScenarioWorkbenchState({scenario: getScenario('single-normal'), params: readUrlParams(new URL('http://localhost:5173/?scenario=single-normal&mockStep=confirm')), store})

		expect(store.setWizardUrl).toHaveBeenCalledWith('https://example.com/single-normal')
		expect(store.submitUrl).toHaveBeenCalledOnce()
		const lastPatch = vi.mocked(store.setState).mock.calls.at(-1)?.[0]
		expect(lastPatch).toMatchObject({wizardStep: 'confirm'})
	})

	it('applies the playlist loading scaffold scenario directly', async () => {
		const store: ScenarioWorkbenchStore = {reset: vi.fn(), setWizardUrl: vi.fn(), submitUrl: vi.fn().mockResolvedValue(undefined), quickDownload: vi.fn().mockResolvedValue(undefined), setState: vi.fn()}

		await applyScenarioWorkbenchState({scenario: getScenario('playlist-loading'), params: readUrlParams(new URL('http://localhost:5173/?scenario=playlist-loading')), store})

		expect(getScenario('playlist-loading')).toMatchObject({title: 'Playlist loading scaffold', kind: 'state'})
		expect(store.reset).toHaveBeenCalledOnce()
		expect(store.submitUrl).not.toHaveBeenCalled()
		const patch = vi.mocked(store.setState).mock.calls[0]?.[0]
		expect(patch).toMatchObject({wizardStep: 'playlistItems', wizardMode: 'playlist', playlistItems: [], selectedPlaylistItemIds: [], playlistProbeLoading: true, playlistProbeProgress: {phase: 'pages', loaded: 33}})
	})

	it('applies profile scenario states through the workbench interface', async () => {
		const store: ScenarioWorkbenchStore = {reset: vi.fn(), setWizardUrl: vi.fn(), submitUrl: vi.fn().mockResolvedValue(undefined), quickDownload: vi.fn().mockResolvedValue(undefined), setState: vi.fn()}

		await applyScenarioWorkbenchState({scenario: getScenario('profiles-home-clipboard-single'), params: readUrlParams(new URL('http://localhost:5173/?scenario=profiles-home-clipboard-single')), store})

		expect(store.reset).toHaveBeenCalledOnce()
		expect(store.submitUrl).not.toHaveBeenCalled()
		expect(vi.mocked(store.setState).mock.calls[0]?.[0]).toMatchObject({wizardStep: 'url', wizardUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'})

		vi.mocked(store.reset).mockClear()
		vi.mocked(store.setState).mockClear()

		await applyScenarioWorkbenchState({scenario: getScenario('profiles-playlist-cap'), params: readUrlParams(new URL('http://localhost:5173/?scenario=profiles-playlist-cap')), store})

		const playlistCapPatch = vi.mocked(store.setState).mock.calls[0]?.[0]
		expect(store.reset).toHaveBeenCalledOnce()
		expect(playlistCapPatch).toMatchObject({wizardStep: 'url', wizardMode: 'playlist', playlistTitle: 'Mock Browser Playlist', playlistLikelyCapped: true, quickPlaylistCapDialogOpen: true})
		expect((playlistCapPatch as {playlistItems?: unknown[]}).playlistItems).toHaveLength(100)

		expect(getScenario('profiles-bulk-huge-input')).toMatchObject({title: 'Bulk URLs huge input', kind: 'profile'})
	})

	it('flags only scoped playlist reloads for the empty-scope scenario', () => {
		const scenario = getScenario('playlist-scope-empty-reload')

		expect(shouldMockEmptyPlaylistScopeReload(scenario, 'auto', {items: {kind: 'range', from: 50, to: 60}})).toBe(false)
		expect(shouldMockEmptyPlaylistScopeReload(scenario, 'playlist', {items: {kind: 'app-limit'}})).toBe(false)
		expect(shouldMockEmptyPlaylistScopeReload(scenario, 'playlist', {items: {kind: 'first', count: 50}})).toBe(true)
		expect(shouldMockEmptyPlaylistScopeReload(scenario, 'playlist', {items: {kind: 'range', from: 50, to: 60}})).toBe(true)
		expect(shouldMockEmptyPlaylistScopeReload(getScenario('playlist-normal'), 'playlist', {items: {kind: 'range', from: 50, to: 60}})).toBe(false)
	})

	it('targets wizard probe errors via ?probeError=kind param by default', async () => {
		const paramsBot = readUrlParams(new URL('http://localhost:5173/?probeError=botBlock'))
		const paramsRate = readUrlParams(new URL('http://localhost:5173/?probeError=rateLimit'))
		const paramsInvalid = readUrlParams(new URL('http://localhost:5173/?probeError=notAKind'))
		const paramsNone = readUrlParams(new URL('http://localhost:5173/'))
		const store: ScenarioWorkbenchStore = {reset: vi.fn(), setWizardUrl: vi.fn(), submitUrl: vi.fn().mockResolvedValue(undefined), quickDownload: vi.fn().mockResolvedValue(undefined), setState: vi.fn()}

		expect(paramsBot.probeErrorKind).toBe('botBlock')
		expect(paramsBot.probeErrorTarget).toBe('wizard')
		expect(paramsRate.probeErrorKind).toBe('rateLimit')
		expect(paramsRate.probeErrorTarget).toBe('wizard')
		expect(paramsInvalid.probeErrorKind).toBeNull()
		expect(paramsNone.probeErrorKind).toBeNull()

		const stateBot = buildScenarioAppApiState(getScenario('default'), paramsBot)
		expect('probeError' in stateBot).toBe(false)
		expect(stateBot.probeResult).toBeNull()

		await applyScenarioWorkbenchState({scenario: getScenario('default'), params: paramsBot, store})
		expect(store.reset).toHaveBeenCalledOnce()
		expect(store.setWizardUrl).toHaveBeenCalledWith('https://example.com/default?mockProbeError=botBlock')
		expect(store.submitUrl).toHaveBeenCalledOnce()
		expect(store.quickDownload).not.toHaveBeenCalled()
	})

	it('targets quick download probe errors via ?probeErrorTarget=quick-download', async () => {
		const paramsQuick = readUrlParams(new URL('http://localhost:5173/?probeError=rateLimit&probeErrorTarget=quick-download'))
		const paramsInvalid = readUrlParams(new URL('http://localhost:5173/?probeError=botBlock&probeErrorTarget=nope'))
		const store: ScenarioWorkbenchStore = {reset: vi.fn(), setWizardUrl: vi.fn(), submitUrl: vi.fn().mockResolvedValue(undefined), quickDownload: vi.fn().mockResolvedValue(undefined), setState: vi.fn()}

		expect(paramsQuick.probeErrorKind).toBe('rateLimit')
		expect(paramsQuick.probeErrorTarget).toBe('quick-download')
		expect(paramsInvalid.probeErrorTarget).toBe('wizard')

		await applyScenarioWorkbenchState({scenario: getScenario('default'), params: paramsQuick, store})

		expect(store.reset).toHaveBeenCalledOnce()
		expect(store.setWizardUrl).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ&mockProbeError=rateLimit')
		expect(store.quickDownload).toHaveBeenCalledOnce()
		expect(store.submitUrl).not.toHaveBeenCalled()
	})

	it('builds update and diagnostics fixtures', () => {
		expect(buildScenarioAppApiState(getScenario('update-homebrew')).update?.installChannel).toBe('homebrew')

		const diagnostics = buildScenarioAppApiState(getScenario('diagnostics-ytdlp-missing')).warmUp
		expect(diagnostics.completed).toBe(false)
		expect(diagnostics.blockingFailures).toEqual(['yt-dlp'])
		expect(diagnostics.dependencies['yt-dlp'].state).toBe('failed')
	})

	it('only requests the browser-mock startup splash for startup-focused states', () => {
		const readyDefault = buildScenarioAppApiState(getScenario('default'))
		expect(shouldShowBrowserMockStartupSplash({launchMode: 'ready', warmUp: readyDefault.warmUp})).toBe(false)

		const readyQueue = buildScenarioAppApiState(getScenario('queue-running'))
		expect(shouldShowBrowserMockStartupSplash({launchMode: 'ready', warmUp: readyQueue.warmUp})).toBe(false)

		expect(shouldShowBrowserMockStartupSplash({launchMode: 'cold-loading', warmUp: readyDefault.warmUp})).toBe(true)
		expect(shouldShowBrowserMockStartupSplash({launchMode: 'cold-error', warmUp: readyDefault.warmUp})).toBe(true)

		const blockedWarmup = buildScenarioAppApiState(getScenario('diagnostics-ytdlp-missing')).warmUp
		expect(shouldShowBrowserMockStartupSplash({launchMode: 'ready', warmUp: blockedWarmup})).toBe(true)

		const incompleteWarmup = buildScenarioAppApiState(getScenario('diagnostics-warmup-running')).warmUp
		expect(shouldShowBrowserMockStartupSplash({launchMode: 'ready', warmUp: incompleteWarmup})).toBe(true)
	})

	it('builds new queue scenarios', () => {
		const pausedHeld = buildScenarioAppApiState(getScenario('queue-paused-held'))
		expect(pausedHeld.queueItems).toHaveLength(1)
		expect(pausedHeld.queueItems[0].status).toBe('paused-held')

		const cancelled = buildScenarioAppApiState(getScenario('queue-cancelled'))
		expect(cancelled.queueItems).toHaveLength(1)
		expect(cancelled.queueItems[0].status).toBe('cancelled')

		const multi = buildScenarioAppApiState(getScenario('queue-multi'))
		expect(multi.queueItems).toHaveLength(6)
		const statuses = multi.queueItems.map(item => item.status)
		expect(statuses).toContain('running')
		expect(statuses).toContain('pending')
		expect(statuses).toContain('paused-held')
		expect(statuses).toContain('done')
		expect(statuses).toContain('error')
		expect(statuses).toContain('cancelled')
	})

	it('builds new diagnostics scenarios', () => {
		const ffprobeBroken = buildScenarioAppApiState(getScenario('diagnostics-ffprobe-broken')).warmUp
		expect(ffprobeBroken.blockingFailures).toEqual(['ffprobe'])

		const allMissing = buildScenarioAppApiState(getScenario('diagnostics-all-missing')).warmUp
		expect(new Set(allMissing.blockingFailures)).toEqual(new Set(['yt-dlp', 'ffmpeg', 'ffprobe']))
		expect(allMissing.dependencies['yt-dlp'].state).toBe('failed')
		expect(allMissing.dependencies.ffmpeg.state).toBe('failed')
		expect(allMissing.dependencies.ffprobe.state).toBe('failed')

		const warmupRunning = buildScenarioAppApiState(getScenario('diagnostics-warmup-running')).warmUp
		expect(warmupRunning.completed).toBe(false)
		expect(warmupRunning.blockingFailures).toHaveLength(0)
	})

	it('builds new update scenarios', () => {
		expect(buildScenarioAppApiState(getScenario('default')).update).toBeNull()
		expect(buildScenarioAppApiState(getScenario('profiles-home-clipboard-single')).update).toBeNull()
		expect(buildScenarioAppApiState(getScenario('update-winget')).update?.installChannel).toBe('winget')
		expect(buildScenarioAppApiState(getScenario('update-flatpak')).update?.installChannel).toBe('flatpak')
		expect(buildScenarioAppApiState(getScenario('update-darwin-dmg')).update?.installChannel).toBe('direct')
		const whatsNew = buildScenarioAppApiState(getScenario('update-whats-new'))
		expect(whatsNew.appVersion).toBe('0.4.0-beta.4')
		expect(whatsNew.settings.common.launchCount).toBe(3)
		expect(whatsNew.settings.common.lastReleaseNotesVersionShown).toBe('0.4.0-beta.3')
		expect(whatsNew.update).toBeNull()
		expect(buildScenarioAppApiState(getScenario('update-none')).update).toBeNull()
	})

	it('builds new probe result scenarios', () => {
		const audioOnly = buildScenarioAppApiState(getScenario('probe-audio-only'))
		expect(audioOnly.probeResult?.kind).toBe('video')
		if (audioOnly.probeResult?.kind !== 'video') throw new Error('expected video probe')
		expect(audioOnly.probeResult.isAudioOnlySource).toBe(true)
		expect(audioOnly.probeResult.isLive).toBe(false)

		const withSubs = buildScenarioAppApiState(getScenario('probe-with-subtitles'))
		expect(withSubs.probeResult?.kind).toBe('video')
		if (withSubs.probeResult?.kind !== 'video') throw new Error('expected video probe')
		expect(Object.keys(withSubs.probeResult.subtitles).length).toBeGreaterThan(0)
		expect(Object.keys(withSubs.probeResult.automaticCaptions).length).toBeGreaterThan(0)

		const noFormats = buildScenarioAppApiState(getScenario('probe-no-formats'))
		expect(noFormats.probeResult?.kind).toBe('video')
		if (noFormats.probeResult?.kind !== 'video') throw new Error('expected video probe')
		expect(noFormats.probeResult.formats).toHaveLength(0)

		const liveStream = buildScenarioAppApiState(getScenario('probe-live-stream'))
		expect(liveStream.probeResult?.kind).toBe('video')
		if (liveStream.probeResult?.kind !== 'video') throw new Error('expected video probe')
		expect(liveStream.probeResult.isLive).toBe(true)
	})
})
