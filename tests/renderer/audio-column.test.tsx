// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import {AudioColumn} from '@renderer/components/wizard/format/AudioColumn.js'
import {selectView} from '@renderer/store/formatSelectionView.js'
import type {AudioSelection} from '@renderer/store/types.js'
import type {FormatOption} from '@shared/types.js'

const audio = (formatId: string, track: string, codec: string, ext: string, abr: number, isDrc = false): FormatOption => ({formatId, label: formatId, ext, resolution: 'audio only', abr, audioCodec: codec, audioTrackLabel: track, isDrc, isVideoOnly: false, isAudioOnly: true})

// Two languages; English Opus comes twice, with and without DRC.
const FORMATS: FormatOption[] = [audio('251-en-drc', 'English', 'opus', 'webm', 133, true), audio('251-en', 'English', 'opus', 'webm', 134), audio('140-en', 'English', 'mp4a.40.2', 'm4a', 129), audio('251-es', 'Spanish', 'opus', 'webm', 120), audio('140-es', 'Spanish', 'mp4a.40.2', 'm4a', 129)]

function renderColumn(audioSelection: AudioSelection = {kind: 'native', formatId: '251-en'}): ReturnType<typeof vi.fn> {
	const onSelect = vi.fn()
	const view = selectView({selectedVideoFormatId: '', audioSelection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: FORMATS})
	render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} onSelect={onSelect} />)
	return onSelect
}

const chipNames = (): string[] => screen.getAllByRole('radio').map(radio => radio.getAttribute('aria-label') ?? '')

describe('AudioColumn', () => {
	it('names a stream with no bitrate by its grade, and a CDN copy only once', () => {
		const graded = (formatId: string, grade: 'low' | 'high'): FormatOption => ({formatId, label: formatId, ext: 'mp4', resolution: 'audio only', audioLanguage: 'en', audioTrackLabel: 'English', audioTrackQuality: grade, quality: grade === 'high' ? 2 : 0, isVideoOnly: false, isAudioOnly: true})
		const formats = [graded('akfire-low', 'low'), graded('fastly-low', 'low'), graded('akfire-high', 'high'), graded('fastly-high', 'high')]
		const audioSelection: AudioSelection = {kind: 'native', formatId: 'fastly-high'}
		const view = selectView({selectedVideoFormatId: '', audioSelection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})
		render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} onSelect={vi.fn()} />)

		const streams = screen.getAllByRole('radio').filter(radio => radio.getAttribute('aria-label')?.startsWith('English'))
		expect(streams.map(radio => radio.getAttribute('aria-label'))).toEqual(['English · mp4 · High quality', 'English · mp4 · Low quality'])
		expect(streams.map(radio => radio.textContent)).toEqual([expect.stringContaining('High quality'), expect.stringContaining('Low quality')])
	})

	it("shows one language's streams at a time, opening on the selection's, and says how many languages there are", () => {
		renderColumn()

		expect(screen.getByText('2 languages')).toBeInTheDocument()
		const natives = chipNames().filter(name => name.includes('kbps'))
		expect(natives.length).toBeGreaterThan(0)
		expect(natives.every(name => name.startsWith('English'))).toBe(true)
	})

	it('shows one stream of each DRC pair, and the switch swaps the chosen stream for its twin', () => {
		const onSelect = renderColumn()

		expect(chipNames().some(name => name.includes('133 kbps'))).toBe(false)
		fireEvent.click(screen.getByRole('switch', {name: /Even out loudness/}))

		expect(onSelect).toHaveBeenCalledWith({kind: 'native', formatId: '251-en-drc'})
		expect(chipNames().some(name => name.includes('133 kbps'))).toBe(true)
		expect(chipNames().some(name => name.includes('134 kbps'))).toBe(false)
	})

	it('keeps the codec when the language changes, at the nearest bitrate', async () => {
		const onSelect = renderColumn()

		fireEvent.click(screen.getByTestId('audio-language'))
		const spanish = await screen.findByRole('option', {name: 'Spanish'})
		// Base UI commits an option on Enter; plain jsdom clicks carry no pointer type.
		spanish.focus()
		fireEvent.keyDown(spanish, {key: 'Enter'})

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith({kind: 'native', formatId: '251-es'}))
	})

	it('offers a bitrate only for a lossy conversion, against the best source bitrate', () => {
		renderColumn()
		expect(screen.queryByText('Source is 134 kbps')).not.toBeInTheDocument()

		renderColumn({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192})
		expect(screen.getByText('Source is 134 kbps')).toBeInTheDocument()
	})
})
