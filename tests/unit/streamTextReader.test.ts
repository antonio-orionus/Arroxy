import {describe, expect, it} from 'vitest'
import {createStreamTextReader, splitStderrLines} from '@main/utils/process.js'

// The reporter's own title — a playlist of Persian videos on Windows. Every
// vector below was reproduced against it.
const PERSIAN_LINE = '[download] Destination: G:\\Arroxy\\1\\NzGuL - ین بازی‌ها رابطه‌مونو 😂.en.srt\n'

function pushAll(chunks: Buffer[]): {text: string; lines: string} {
	const reader = createStreamTextReader()
	let text = ''
	let lines = ''
	for (const chunk of chunks) {
		const out = reader.push(chunk)
		text += out.text
		lines += out.lines
	}
	const tail = reader.flush()
	return {text: text + tail.text, lines: lines + tail.lines}
}

describe('createStreamTextReader — multi-byte safety', () => {
	it('survives a split at every byte offset of a non-ASCII line', () => {
		const buf = Buffer.from(PERSIAN_LINE, 'utf8')
		const corrupted: number[] = []
		for (let cut = 1; cut < buf.length; cut++) {
			const {text, lines} = pushAll([buf.subarray(0, cut), buf.subarray(cut)])
			if (text !== PERSIAN_LINE || lines !== PERSIAN_LINE) corrupted.push(cut)
		}
		expect(corrupted).toEqual([])
	})

	it('never emits a replacement character for a mid-character split', () => {
		const buf = Buffer.from('سلام', 'utf8')
		const {text} = pushAll([buf.subarray(0, 3), buf.subarray(3)])
		expect(text).not.toContain('\uFFFD')
		expect(text).toBe('سلام')
	})
})

describe('createStreamTextReader — line framing', () => {
	it('holds a partial line back until its terminator arrives', () => {
		const reader = createStreamTextReader()
		const first = reader.push(Buffer.from('[download] Destination: /tmp/a', 'utf8'))
		expect(first.text).toBe('[download] Destination: /tmp/a')
		expect(first.lines).toBe('')

		const second = reader.push(Buffer.from('.en.srt\n', 'utf8'))
		expect(second.lines).toBe('[download] Destination: /tmp/a.en.srt\n')
	})

	it('treats a bare carriage return as a line boundary', () => {
		const reader = createStreamTextReader()
		expect(reader.push(Buffer.from('[download]  50% of 10MiB\r', 'utf8')).lines).toBe('[download]  50% of 10MiB\r')
	})

	it('releases the trailing line on flush when output never ends in a newline', () => {
		const reader = createStreamTextReader()
		expect(reader.push(Buffer.from('ERROR: no newline here', 'utf8')).lines).toBe('')
		expect(reader.flush().lines).toBe('ERROR: no newline here')
	})

	it('keeps accumulated text complete even while lines are held back', () => {
		const {text, lines} = pushAll([Buffer.from('a\nb', 'utf8')])
		expect(text).toBe('a\nb')
		expect(lines).toBe('a\nb')
	})

	it('does not emit a phantom line for CRLF split across chunks', () => {
		const reader = createStreamTextReader()
		reader.push(Buffer.from('one\r', 'utf8'))
		const second = reader.push(Buffer.from('\ntwo\n', 'utf8'))
		expect(splitStderrLines(second.lines)).toEqual(['two'])
	})
})

describe('splitStderrLines — carriage-return framing', () => {
	it('splits progress redraws separated by bare carriage returns', () => {
		expect(splitStderrLines('[download]   1% of 10MiB\r[download]  50% of 10MiB\r')).toEqual(['[download]   1% of 10MiB', '[download]  50% of 10MiB'])
	})

	it('surfaces a real line flushed behind a progress redraw', () => {
		const blob = '[download]  99.9% of 10MiB at 1KiB/s ETA 00:00\r[download] Destination: /out/Video.en.srt\n'
		expect(splitStderrLines(blob)).toContain('[download] Destination: /out/Video.en.srt')
	})
})
