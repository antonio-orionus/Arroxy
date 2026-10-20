// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import {AudioColumn} from '@renderer/components/wizard/format/AudioColumn.js'
import {selectView} from '@renderer/store/formatSelectionView.js'
import type {AudioSelection} from '@renderer/store/types.js'
import type {FormatOption} from '@shared/types.js'

const audio = (formatId: string, track: string, codec: string, ext: string, abr: number, isDrc = false): FormatOption => ({formatId, label: formatId, ext, resolution: 'audio only', abr, audioCodec: codec, audioTrackLabel: track, isDrc, isVideoOnly: false, isAudioOnly: true})

// Two languages; English Opus comes twice, with and without DRC.
const FORMATS: FormatOption[] = [audio('251-en-drc', 'English', 'opus', 'webm', 133, true), audio('251-en', 'English', 'opus', 'webm', 134), audio('140-en', 'English', 'mp4a.40.2', 'm4a', 129), audio('251-es', 'Spanish', 'opus', 'webm', 131), audio('140-es', 'Spanish', 'mp4a.40.2', 'm4a', 129)]

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

	// yt-dlp copies a stream already in the target codec, so a conversion
	// starts from the shown language's stream in that codec.
	it("converts the shown language's stream in the target codec", () => {
		const onSelect = renderColumn()

		fireEvent.click(screen.getByRole('radio', {name: 'Convert · m4a'}))
		expect(onSelect).toHaveBeenLastCalledWith({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192, sourceFormatId: '140-en'})
		fireEvent.click(screen.getByRole('radio', {name: 'Convert · opus'}))
		expect(onSelect).toHaveBeenLastCalledWith({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192, sourceFormatId: '251-en'})
	})

	it('keeps DRC when the switch asks for it', () => {
		const onSelect = renderColumn({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192, sourceFormatId: '251-en'})

		fireEvent.click(screen.getByRole('switch', {name: /Even out loudness/}))
		expect(onSelect).toHaveBeenLastCalledWith({kind: 'convert-lossy', target: 'opus', bitrateKbps: 192, sourceFormatId: '251-en-drc'})
	})

	it('keeps the target codec when the language of a conversion changes', async () => {
		const onSelect = renderColumn({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192, sourceFormatId: '140-en'})

		fireEvent.click(screen.getByTestId('audio-language'))
		const spanish = await screen.findByRole('option', {name: 'Spanish'})
		spanish.focus()
		fireEvent.keyDown(spanish, {key: 'Enter'})

		await waitFor(() => expect(onSelect).toHaveBeenCalledWith({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192, sourceFormatId: '140-es'}))
	})

	it("says a copy keeps the source's bitrate instead of offering one", () => {
		renderColumn({kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192, sourceFormatId: '140-en'})

		expect(screen.getByTestId('audio-copy-note')).toHaveTextContent('129 kbps, as the source has it: the stream is already M4A, so it is copied, not re-encoded')
		expect(screen.queryByTestId('audio-bitrate-strip')).not.toBeInTheDocument()
	})

	it('offers a bitrate when the conversion re-encodes', () => {
		renderColumn({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192, sourceFormatId: '251-en'})

		expect(screen.getByTestId('audio-bitrate-strip')).toBeInTheDocument()
		expect(screen.queryByTestId('audio-copy-note')).not.toBeInTheDocument()
	})

	it('offers keep as-is in audio mode on a site with only combined files', () => {
		const onSelect = vi.fn()
		const combined: FormatOption = {formatId: '18', label: '360p', ext: 'mp4', resolution: '640x360', isVideoOnly: false, isAudioOnly: false, audioCodec: 'mp4a.40.2'}
		const audioSelection: AudioSelection = {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}
		const view = selectView({selectedVideoFormatId: '', audioSelection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: [combined]})
		render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={audioSelection} onSelect={onSelect} />)

		fireEvent.click(screen.getByRole('radio', {name: /^Keep as-is/}))
		expect(onSelect).toHaveBeenCalledWith({kind: 'extract', formatId: '18'})
	})

	// One language: the bridge picks the source, unless the DRC switch names its DRC master.
	it('names the DRC stream for a conversion on a single-language video when DRC is switched on', () => {
		const formats: FormatOption[] = [audio('251', '', 'opus', 'webm', 130), audio('251-drc', '', 'opus', 'webm', 131, true), audio('140', '', 'mp4a.40.2', 'm4a', 129)]
		const onSelect = vi.fn()
		const selection: AudioSelection = {kind: 'convert-lossy', target: 'opus', bitrateKbps: 192}
		const view = selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})
		render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={selection} onSelect={onSelect} />)

		fireEvent.click(screen.getByRole('switch', {name: /Even out loudness/}))
		expect(onSelect).toHaveBeenLastCalledWith({...selection, sourceFormatId: '251-drc'})
	})

	it("names the conversion source's own bitrate, not the highest one", () => {
		const formats: FormatOption[] = [audio('328', '', 'ec-3', 'm4a', 384), audio('251', '', 'opus', 'webm', 104)]
		const selection: AudioSelection = {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192}
		const view = selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})
		render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={selection} onSelect={vi.fn()} />)

		expect(screen.getByText('Source is 104 kbps')).toBeInTheDocument()
	})

	it('keeps DRC when a conversion target is picked with the switch already on', () => {
		const formats: FormatOption[] = [audio('251', '', 'opus', 'webm', 130), audio('251-drc', '', 'opus', 'webm', 131, true), audio('140', '', 'mp4a.40.2', 'm4a', 129)]
		const onSelect = vi.fn()
		const selection: AudioSelection = {kind: 'native', formatId: '251-drc'}
		const view = selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})
		render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={selection} onSelect={onSelect} />)

		fireEvent.click(screen.getByRole('radio', {name: 'Convert · mp3'}))
		expect(onSelect).toHaveBeenLastCalledWith({kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192, sourceFormatId: '251-drc'})
	})

	it('names no source bitrate when the source has none', () => {
		const formats: FormatOption[] = [{...audio('251-en', 'English', 'opus', 'webm', 0), abr: undefined}, audio('251-es', 'Spanish', 'opus', 'webm', 384)]
		const selection: AudioSelection = {kind: 'convert-lossy', target: 'mp3', bitrateKbps: 192, sourceFormatId: '251-en'}
		const view = selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats})
		render(<AudioColumn view={view.audio} mode={view.mode} audioSelection={selection} onSelect={vi.fn()} />)

		expect(screen.queryByText(/^Source is/)).not.toBeInTheDocument()
	})

	// A conversion that names no stream converts the default track: the controls show that one.
	it("follows an unnamed conversion's own source, not the language shown before", () => {
		const formats = FORMATS.map(format => (format.audioTrackLabel === 'English' ? {...format, isDefaultAudio: true} : format))
		const view = (selection: AudioSelection): ReturnType<typeof selectView>['audio'] => selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats}).audio
		const spanish: AudioSelection = {kind: 'native', formatId: '251-es'}
		const {rerender} = render(<AudioColumn view={view(spanish)} mode="audio-only" audioSelection={spanish} onSelect={vi.fn()} />)
		expect(screen.getByTestId('audio-language')).toHaveTextContent('Spanish')

		const conversion: AudioSelection = {kind: 'convert-lossy', target: 'opus', bitrateKbps: 192}
		rerender(<AudioColumn view={view(conversion)} mode="audio-only" audioSelection={conversion} onSelect={vi.fn()} />)
		expect(screen.getByTestId('audio-language')).toHaveTextContent('English')
	})

	it("follows a conversion's source to its DRC master, twin or not", () => {
		const formats = FORMATS.map(format => (format.audioTrackLabel === 'English' ? {...format, isDefaultAudio: true} : format))
		const view = (selection: AudioSelection): ReturnType<typeof selectView>['audio'] => selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats}).audio
		const drcPick: AudioSelection = {kind: 'native', formatId: '251-en-drc'}
		const {rerender} = render(<AudioColumn view={view(drcPick)} mode="audio-only" audioSelection={drcPick} onSelect={vi.fn()} />)
		expect(screen.getByRole('switch', {name: /Even out loudness/})).toBeChecked()

		// An unnamed M4A conversion converts the plain AAC 140, which has no DRC twin.
		const conversion: AudioSelection = {kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192}
		rerender(<AudioColumn view={view(conversion)} mode="audio-only" audioSelection={conversion} onSelect={vi.fn()} />)
		expect(screen.getByRole('switch', {name: /Even out loudness/})).not.toBeChecked()
	})

	it('sets DRC when a conversion takes over the same stream a native pick had', () => {
		const formats = FORMATS.map(format => (format.audioTrackLabel === 'English' ? {...format, isDefaultAudio: true} : format))
		const view = (selection: AudioSelection): ReturnType<typeof selectView>['audio'] => selectView({selectedVideoFormatId: '', audioSelection: selection, lastConvertBitrate: 192, mediaKind: 'audio', wizardFormats: formats}).audio
		const drcPick: AudioSelection = {kind: 'native', formatId: '251-en-drc'}
		const {rerender} = render(<AudioColumn view={view(drcPick)} mode="audio-only" audioSelection={drcPick} onSelect={vi.fn()} />)
		// The unpaired AAC 140 leaves the switch as it was.
		const aac: AudioSelection = {kind: 'native', formatId: '140-en'}
		rerender(<AudioColumn view={view(aac)} mode="audio-only" audioSelection={aac} onSelect={vi.fn()} />)
		expect(screen.getByRole('switch', {name: /Even out loudness/})).toBeChecked()

		const conversion: AudioSelection = {kind: 'convert-lossy', target: 'm4a', bitrateKbps: 192}
		rerender(<AudioColumn view={view(conversion)} mode="audio-only" audioSelection={conversion} onSelect={vi.fn()} />)
		expect(screen.getByRole('switch', {name: /Even out loudness/})).not.toBeChecked()
	})
})
