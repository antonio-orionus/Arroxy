import {describe, expect, it} from 'vite-plus/test'
import {i18next} from '@shared/i18n/index.js'
import {prepareManualQueueSubmission} from '@renderer/store/wizard/queueSubmission.js'
import {wizardState} from '../shared/queueSubmissionState.js'

describe('queue labels in a translated locale', () => {
	it('localizes Smart TV MP4 playlist queue labels', async () => {
		await i18next.changeLanguage('de')
		try {
			const prepared = prepareManualQueueSubmission(wizardState({wizardMode: 'playlist', selectedPlaylistItemIds: ['a'], playlistSelection: {kind: 'video', tier: '1080', codec: 'mp4'}}), 'normal')

			expect(prepared?.items[0]?.formatLabel).toBe('Smart-TV H.264 MP4 · Bis 1080p')
		} finally {
			await i18next.changeLanguage('en')
		}
	})
})
