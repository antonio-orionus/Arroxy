// @vitest-environment jsdom
import {fireEvent, render, screen, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {StepPlaylistProfiles} from '@renderer/components/wizard/StepPlaylistProfiles.js'
import {PROFILE_ICONS} from '@renderer/components/wizard/downloadProfileVisuals.js'
import {useAppStore} from '@renderer/store/useAppStore.js'

function profile(id: string, name: string, icon: DownloadProfile['icon']): DownloadProfile {
	return {
		id,
		name,
		icon,
		media: {kind: 'video-audio', codec: 'best', tiers: ['1080'], audio: {format: 'best'}},
		subtitles: {enabled: false, languages: [], source: 'manual-first', mode: 'sidecar', format: 'srt'},
		output: {kind: 'default'},
		filename: {kind: 'default'},
		subfolder: {enabled: false, name: ''},
		sponsorBlock: {mode: 'off', categories: []},
		embed: {chapters: true, metadata: true, thumbnail: false, description: false, thumbnailSidecar: false},
		createdAt: '2026-08-12T00:00:00.000Z',
		updatedAt: '2026-08-12T00:00:00.000Z'
	} as DownloadProfile
}

const ARCHIVE = profile('archive', 'Archive 4K', 'archive')
const PODCAST = profile('podcast', 'Podcast MP3', 'podcast')
const ARCHIVE_REF: DownloadProfileRef = {kind: 'custom', id: 'archive'}
const PODCAST_REF: DownloadProfileRef = {kind: 'custom', id: 'podcast'}

// jsdom reports a zero-height scroll container, so the real virtualizer only
// windows in a single row. Stub it to always render every row — same fix
// queue-manager-tab.test.tsx uses for the same reason.
vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		return {getTotalSize: () => count * size, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size, start: index * size})), measureElement: () => undefined}
	}
}))

// The action-bar / "More…" split (Task 7 spec: first eight `options`) is
// exercised by download-profile-actions.test.ts against the real builtin
// catalog. Mocking the model here keeps this suite about StepPlaylistProfiles'
// own wiring — selection, assignment, filtering — independent of how many
// builtin profiles exist.
vi.mock('@renderer/components/wizard/downloadProfileActions.js', () => ({
	buildDownloadProfileActionModel: () => ({
		activeProfile: ARCHIVE,
		activeRef: ARCHIVE_REF,
		ActiveIcon: PROFILE_ICONS.archive,
		activeSummary: 'best video · best audio',
		options: [
			{profile: ARCHIVE, ref: ARCHIVE_REF, Icon: PROFILE_ICONS.archive, label: 'Archive 4K', active: true},
			{profile: PODCAST, ref: PODCAST_REF, Icon: PROFILE_ICONS.podcast, label: 'Podcast MP3', active: false}
		]
	})
}))

function renderStep(): ReturnType<typeof render> {
	return render(<StepPlaylistProfiles />)
}

beforeEach(() => {
	useAppStore.setState({
		wizardMode: 'playlist',
		wizardStep: 'playlistProfiles',
		multiProfileMode: true,
		playlistItems: [
			{id: 'a', url: 'https://example.com/a', title: 'Under my Spell', thumbnail: '', duration: 200, playlistIndex: 0, videoId: 'a'},
			{id: 'b', url: 'https://example.com/b', title: 'One Last Breath', thumbnail: '', duration: 210, playlistIndex: 1, videoId: 'b'},
			{id: 'c', url: 'https://example.com/c', title: 'Burn the Witch', thumbnail: '', duration: 220, playlistIndex: 2, videoId: 'c'}
		],
		selectedPlaylistItemIds: ['a', 'b', 'c'],
		removedPlaylistItemIds: [],
		playlistProfileAssignments: {},
		settings: {profiles: {active: ARCHIVE_REF, custom: [ARCHIVE, PODCAST], overrides: []}}
	} as never)
})

describe('StepPlaylistProfiles', () => {
	it('starts every item on the active profile', () => {
		renderStep()
		expect(screen.getAllByText('Archive 4K')).toHaveLength(3)
	})

	it('assigns the clicked profile to the selected rows', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		expect(within(screen.getByTestId('profile-row-b')).getByText('Podcast MP3')).toBeInTheDocument()
	})

	it('extends the selection with shift-click before assigning', () => {
		renderStep()
		fireEvent.click(screen.getByText('Under my Spell'))
		fireEvent.click(screen.getByText('Burn the Witch'), {shiftKey: true})
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		expect(screen.getAllByText('Podcast MP3')).toHaveLength(3)
	})

	it('filters rows by profile without changing assignments', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		fireEvent.click(screen.getByTestId('filter-profile-podcast'))
		expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(1)
	})
})
