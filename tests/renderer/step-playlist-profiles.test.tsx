// @vitest-environment jsdom
import {fireEvent, render, screen, within} from '@testing-library/react'
import {beforeEach, describe, expect, it, vi} from 'vitest'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {StepPlaylistProfiles} from '@renderer/components/wizard/StepPlaylistProfiles.js'
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

// jsdom reports a zero-height scroll container, so the real virtualizer only
// windows in a single row. Stub it to always render every row — same fix
// queue-manager-tab.test.tsx uses for the same reason.
vi.mock('@tanstack/react-virtual', () => ({
	useVirtualizer: ({count, estimateSize}: {count: number; estimateSize: () => number}) => {
		const size = estimateSize()
		return {getTotalSize: () => count * size, getVirtualItems: () => Array.from({length: count}, (_, index) => ({index, key: index, size, start: index * size})), measureElement: () => undefined}
	}
}))

// The real catalog + downloadProfileActions model is used everywhere below —
// no mock. With the screen's baseline-then-custom-then-builtin ordering
// (playlistProfileOrder.ts), the two custom fixture profiles below sort to
// the front of the action bar, so the click-based tests reach them directly
// without needing to open "More…". The one test that specifically covers the
// overflow branch (further down) forces a builtin id, 'audio-only', past the
// eight visible slots and asserts it's reachable through the popover.
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

	it('puts the baseline and custom profiles ahead of builtins in the visible action bar', () => {
		renderStep()
		// The action bar is disabled with nothing selected; select a row so the
		// buttons (including "More…") are interactive.
		fireEvent.click(screen.getByText('One Last Breath'))

		// `allDownloadProfiles` (and so the unordered catalog model) returns all
		// 10 builtins before either custom profile — under that order "archive"
		// and "podcast" would sit at slots 10-11, past the action bar's 8 visible
		// slots, and these testids would only exist once "More…" is opened. This
		// asserts they're reachable directly, proving the screen re-sorts to
		// baseline-then-custom-then-builtin instead of using catalog order as-is.
		const bar = within(screen.getByTestId('playlist-profile-actions'))
		expect(bar.getByTestId('assign-profile-archive')).toBeInTheDocument()
		expect(bar.getByTestId('assign-profile-podcast')).toBeInTheDocument()

		// And a builtin — 'audio-only', the likeliest pick this reordering exists
		// to surface — is pushed out to the overflow instead, since the two
		// customs now occupy two of the eight visible slots.
		expect(screen.queryByTestId('assign-profile-audio-only')).not.toBeInTheDocument()
		fireEvent.click(screen.getByTestId('playlist-profile-more'))
		expect(screen.getByTestId('assign-profile-audio-only')).toBeInTheDocument()
	})

	it('assigns a builtin profile reached through the "More…" overflow popover', () => {
		renderStep()
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('playlist-profile-more'))
		fireEvent.click(screen.getByTestId('assign-profile-audio-only'))

		expect(within(screen.getByTestId('profile-row-b')).getByText('Audio only')).toBeInTheDocument()
		// Untouched rows keep the baseline profile.
		expect(within(screen.getByTestId('profile-row-a')).getByText('Archive 4K')).toBeInTheDocument()
		expect(within(screen.getByTestId('profile-row-c')).getByText('Archive 4K')).toBeInTheDocument()
	})

	it('Ctrl/Cmd+A selects only the currently filtered rows, not every item', () => {
		renderStep()
		// Move 'b' onto Podcast first so the "archive" filter chip narrows to just
		// 'a' and 'c' — and so 'b' ends up on a *third*, distinct profile from the
		// one the filtered bulk-assign below applies. If Ctrl+A incorrectly
		// selected every row instead of only the filtered ones, 'b' would also
		// flip to that third profile and the final assertion on 'b' would fail.
		fireEvent.click(screen.getByText('One Last Breath'))
		fireEvent.click(screen.getByTestId('assign-profile-podcast'))
		fireEvent.click(screen.getByTestId('filter-profile-archive'))
		expect(screen.getAllByTestId(/^profile-row-/)).toHaveLength(2)

		fireEvent.keyDown(window, {key: 'a', code: 'KeyA', ctrlKey: true})
		fireEvent.click(screen.getByTestId('assign-profile-best-quality'))

		// Switch back to the unfiltered view to inspect every row: 'a' and 'c'
		// were selected by Ctrl+A (visible under the "archive" filter) and should
		// have moved to "Best available"; 'b' was filtered out of view and must
		// keep "Podcast MP3" untouched.
		fireEvent.click(screen.getByTestId('filter-profile-all'))
		expect(within(screen.getByTestId('profile-row-a')).getByText('Best available')).toBeInTheDocument()
		expect(within(screen.getByTestId('profile-row-c')).getByText('Best available')).toBeInTheDocument()
		expect(within(screen.getByTestId('profile-row-b')).getByText('Podcast MP3')).toBeInTheDocument()
	})
})
