// @vitest-environment jsdom
import {act, render, screen, waitFor} from '@testing-library/react'
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vite-plus/test'
import {selectionSourceFromOptions} from '@shared/ytdlp/optionSelectionSource.js'
import {defaultAppSettings} from '@shared/constants.js'
import type {FormatOption} from '@shared/types.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {StepReview} from '@renderer/components/wizard/StepReview.js'
import {FormatFooterWarnings} from '@renderer/components/wizard/format/FormatFooterWarnings.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

// Both places that show the QuickTime caveat, on a Mac whose chip decodes AV1
// (as an M3 and later do) and on Windows. The probe answers once per app run,
// so this whole file runs on that one Mac.
const VP9: FormatOption = {formatId: '248', label: '1080p vp9', ext: 'webm', resolution: '1920x1080', videoCodec: 'vp9', isVideoOnly: true, isAudioOnly: false}
const AV1: FormatOption = {formatId: '399', label: '1080p av1', ext: 'mp4', resolution: '1920x1080', videoCodec: 'av01.0.08M.08', isVideoOnly: true, isAudioOnly: false}
const AAC: FormatOption = {formatId: '140', label: 'm4a', ext: 'm4a', resolution: 'audio only', audioCodec: 'mp4a.40.2', abr: 130, isVideoOnly: false, isAudioOnly: true}
const FORMATS = [VP9, AV1, AAC]

const originalPlatform = window.platform
// A plain counter, not a mock: the test setup clears mock calls between tests,
// while the probe asks once for the whole file.
let probes = 0
async function decodingInfo(): Promise<Partial<MediaCapabilitiesDecodingInfo>> {
	probes += 1
	return {supported: true, smooth: true, powerEfficient: true}
}

beforeAll(() => {
	Object.defineProperty(navigator, 'mediaCapabilities', {configurable: true, value: {decodingInfo}})
})

afterAll(() => {
	Reflect.deleteProperty(navigator, 'mediaCapabilities')
	window.platform = originalPlatform
})

beforeEach(() => {
	window.platform = 'darwin'
	window.appApi = buildMockAppApi()
	useAppStore.setState({
		settings: defaultAppSettings('/downloads'),
		wizardMode: 'single',
		wizardFormats: FORMATS,
		wizardFormatSelection: selectionSourceFromOptions(FORMATS),
		wizardSubtitles: {},
		wizardAutomaticCaptions: {},
		wizardIsAudioOnlySource: false,
		wizardMediaKind: 'video',
		wizardSubtitleLanguages: [],
		wizardSubtitleMode: 'sidecar',
		wizardEmbedThumbnail: false,
		wizardFileType: 'mp4',
		wizardProfile: null,
		wizardProfileBaseline: null,
		wizardOutputDir: '/downloads',
		selectedVideoFormatId: VP9.formatId,
		audioSelection: {kind: 'native', formatId: AAC.formatId}
	})
})

// Lets the chip's answer reach the components before asserting what they hide.
async function probeAnswered(): Promise<void> {
	await waitFor(() => expect(probes).toBe(1))
	await act(async () => undefined)
}

describe('Review — MP4 caveat', () => {
	it('warns about VP9 in an MP4 on a Mac, even one that decodes AV1', async () => {
		render(<StepReview />)
		await probeAnswered()

		expect(screen.getByTestId('review-mp4-caveat')).toHaveTextContent("VP9 in an MP4 won't play video in QuickTime.")
	})

	it('says nothing about AV1 on a Mac whose chip decodes it', async () => {
		useAppStore.setState({selectedVideoFormatId: AV1.formatId})
		render(<StepReview />)
		await probeAnswered()

		expect(screen.queryByTestId('review-mp4-caveat')).not.toBeInTheDocument()
	})

	it('says nothing on Windows, which has no QuickTime', () => {
		window.platform = 'win32'
		render(<StepReview />)

		expect(screen.queryByTestId('review-mp4-caveat')).not.toBeInTheDocument()
	})
})

describe('Format footer — MP4 caveat on a Mac that decodes AV1', () => {
	it('drops the AV1 line and keeps the VP9 one', async () => {
		useAppStore.setState({selectedVideoFormatId: AV1.formatId})
		const {unmount} = render(<FormatFooterWarnings />)
		await probeAnswered()
		expect(screen.queryByTestId('summary-mp4-caveat')).not.toBeInTheDocument()
		unmount()

		useAppStore.setState({selectedVideoFormatId: VP9.formatId})
		render(<FormatFooterWarnings />)
		expect(screen.getByTestId('summary-mp4-caveat')).toBeInTheDocument()
	})
})
