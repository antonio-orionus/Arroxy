// @vitest-environment jsdom
import {Profiler, type ReactNode} from 'react'
import {act, cleanup, render} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it} from 'vite-plus/test'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {applyQueueProjectionBatch} from '@renderer/store/queueProjection.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {AboutDialog} from '@renderer/components/system/AboutDialog.js'
import {DonateDialog} from '@renderer/components/system/DonateDialog.js'
import {ThemeToggle} from '@renderer/components/system/ThemeToggle.js'
import {BehaviorSettingsPanel} from '@renderer/components/wizard/BehaviorSettingsPanel.js'
import {CookiesSettingsFields} from '@renderer/components/wizard/CookiesSettingsFields.js'
import {DownloadProfilesSettingsTab} from '@renderer/components/wizard/DownloadProfilesSettingsTab.js'
import {MixedUrlPromptDialog} from '@renderer/components/wizard/MixedUrlPromptDialog.js'
import {NetworkPacingSettings} from '@renderer/components/wizard/NetworkPacingSettings.js'
import {PlaylistProbeLimitSelector} from '@renderer/components/wizard/PlaylistProbeLimitSelector.js'
import {PlaylistScopeControl} from '@renderer/components/wizard/PlaylistScopeControl.js'
import {ProfileEditLine} from '@renderer/components/wizard/ProfileEditLine.js'
import {StepConfirm} from '@renderer/components/wizard/StepConfirm.js'
import {StepError} from '@renderer/components/wizard/StepError.js'
import {StepFolderConfirm} from '@renderer/components/wizard/StepFolderConfirm.js'
import {StepOutput} from '@renderer/components/wizard/StepOutput.js'
import {StepPlaylistItems} from '@renderer/components/wizard/StepPlaylistItems.js'
import {StepPlaylistPresets} from '@renderer/components/wizard/StepPlaylistPresets.js'
import {StepPlaylistProfiles} from '@renderer/components/wizard/StepPlaylistProfiles.js'
import {StepReview} from '@renderer/components/wizard/StepReview.js'
import {StepSponsorBlock} from '@renderer/components/wizard/StepSponsorBlock.js'
import {SubtitleFields} from '@renderer/components/wizard/SubtitleFields.js'
import {BotWallNotice} from '@renderer/components/wizard/format/BotWallNotice.js'
import {RateLimitNotice} from '@renderer/components/wizard/format/RateLimitNotice.js'
import {QUEUE_STATUS} from '@shared/schemas.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {makeItem} from '../shared/fixtures.js'
import {buildAppSettings} from '../shared/settingsFixtures.js'

// A queue progress event rewrites `queue` many times a second while a download
// runs. Settings, wizard and dialog components read none of it, so a progress
// update must not re-render them: each one subscribes to the fields it reads.

const SCREENS: readonly [string, () => ReactNode][] = [
	['AboutDialog', () => <AboutDialog />],
	['DonateDialog', () => <DonateDialog />],
	['ThemeToggle', () => <ThemeToggle />],
	['BehaviorSettingsPanel', () => <BehaviorSettingsPanel />],
	['CookiesSettingsFields', () => <CookiesSettingsFields />],
	['DownloadProfilesSettingsTab', () => <DownloadProfilesSettingsTab />],
	['MixedUrlPromptDialog', () => <MixedUrlPromptDialog />],
	['NetworkPacingSettings', () => <NetworkPacingSettings />],
	['PlaylistProbeLimitSelector', () => <PlaylistProbeLimitSelector />],
	['PlaylistScopeControl', () => <PlaylistScopeControl />],
	['ProfileEditLine', () => <ProfileEditLine />],
	['StepConfirm', () => <StepConfirm />],
	['StepError', () => <StepError />],
	['StepFolderConfirm', () => <StepFolderConfirm />],
	['StepOutput', () => <StepOutput />],
	['StepPlaylistItems', () => <StepPlaylistItems />],
	['StepPlaylistPresets', () => <StepPlaylistPresets />],
	['StepPlaylistProfiles', () => <StepPlaylistProfiles />],
	['StepReview', () => <StepReview />],
	['StepSponsorBlock', () => <StepSponsorBlock />],
	['SubtitleFields', () => <SubtitleFields />],
	['BotWallNotice', () => <BotWallNotice />],
	['RateLimitNotice', () => <RateLimitNotice />]
]

const ITEM_ID = 'running-1'
const PROGRESS_TICKS = 5

// The same path main's progress events take: a batched update applied through
// the queue projection, its patch written to the store.
function progressTick(percent: number): void {
	const item = makeItem({id: ITEM_ID, status: QUEUE_STATUS.running, progressPercent: percent})
	const result = applyQueueProjectionBatch(useAppStore.getState(), {adds: [], updates: new Map([[ITEM_ID, item]]), removes: new Set()})
	act(() => useAppStore.setState(result.patch))
}

describe('store subscriptions', () => {
	beforeEach(() => {
		Object.defineProperty(window, 'appApi', {writable: true, value: buildMockAppApi()})
		useAppStore.setState({initialized: true, initializing: false, settings: buildAppSettings(), queue: [makeItem({id: ITEM_ID, status: QUEUE_STATUS.running, progressPercent: 0})]})
	})

	afterEach(cleanup)

	it.each(SCREENS)('a queue progress update does not re-render %s', (_name, screen) => {
		let commits = 0
		render(
			<Profiler id="screen" onRender={() => commits++}>
				<TooltipProvider>{screen()}</TooltipProvider>
			</Profiler>
		)
		const mounted = commits

		for (let tick = 1; tick <= PROGRESS_TICKS; tick++) progressTick(tick * 10)

		expect(useAppStore.getState().queue[0]?.progressPercent).toBe(PROGRESS_TICKS * 10)
		expect(commits - mounted).toBe(0)
	})

	// Guards the probe above: a field the screen does read still re-renders it.
	it('a wizard change still re-renders StepReview', () => {
		let commits = 0
		render(
			<Profiler id="screen" onRender={() => commits++}>
				<TooltipProvider>
					<StepReview />
				</TooltipProvider>
			</Profiler>
		)
		const mounted = commits

		act(() => useAppStore.setState({wizardOutputDir: '/elsewhere'}))

		expect(commits - mounted).toBeGreaterThan(0)
	})
})
