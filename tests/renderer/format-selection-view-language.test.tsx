import {act, renderHook} from '@testing-library/react'
import {afterEach, describe, expect, it} from 'vite-plus/test'
import {useFormatSelectionView} from '@renderer/store/formatSelectionView.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import type {FormatOption} from '@shared/types.js'

const FORMATS: FormatOption[] = [
	{formatId: '137', label: '1080p mp4 video-only', ext: 'mp4', resolution: '1080p', isVideoOnly: true, isAudioOnly: false, filesize: 1536},
	{formatId: '140', label: 'm4a audio', ext: 'm4a', resolution: 'audio only', abr: 128, isVideoOnly: false, isAudioOnly: true, filesize: 1536}
]

afterEach(async () => {
	await i18next.changeLanguage('en')
})

describe('useFormatSelectionView', () => {
	it('re-formats sizes when the UI language changes', async () => {
		useAppStore.setState({wizardFormats: FORMATS, wizardMediaKind: 'video', selectedVideoFormatId: '137', audioSelection: {kind: 'native', formatId: '140'}})
		const {result} = renderHook(() => useFormatSelectionView())
		expect(result.current.video.rows.find(row => row.formatId === '137')?.size).toBe('1.5 KiB')

		await act(async () => {
			await i18next.changeLanguage('de')
		})

		expect(result.current.video.rows.find(row => row.formatId === '137')?.size).toBe('1,5 KiB')
	})
})
