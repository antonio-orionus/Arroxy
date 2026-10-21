import {render, screen} from '@testing-library/react'
import {I18nextProvider} from 'react-i18next'
import {describe, expect, it} from 'vite-plus/test'
import {QuickPlaylistCapDialog} from '@renderer/components/wizard/QuickPlaylistCapDialog.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {PlaylistEntry} from '@shared/types.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'
import {pseudoI18n, untranslatedWords} from '../shared/pseudoLocale.js'

// Every word the playlist cap dialog shows must come from the catalog (see pseudoLocale).

const ENTRIES: PlaylistEntry[] = Array.from({length: 3}, (_, index) => ({id: `p${index}`, url: `https://youtube.com/watch?v=p${index}`, title: `Video ${index}`, thumbnail: '', playlistIndex: index + 1, videoId: `p${index}`}))

describe('quick playlist cap dialog copy', () => {
	it('takes all its copy from the catalog', async () => {
		window.appApi = buildMockAppApi()
		const base = defaultAppSettings('/tmp')
		useAppStore.setState({settings: {...base, common: {...base.common, playlistProbeLimit: 50}}, playlistItems: ENTRIES, playlistTitle: 'Lo-fi mixes', quickPlaylistCapDialogOpen: true})
		const i18n = await pseudoI18n()
		render(
			<I18nextProvider i18n={i18n}>
				<QuickPlaylistCapDialog />
			</I18nextProvider>
		)

		expect(untranslatedWords(await screen.findByTestId('quick-playlist-cap-dialog'), ['Lo-fi mixes'])).toEqual([])
	})
})
