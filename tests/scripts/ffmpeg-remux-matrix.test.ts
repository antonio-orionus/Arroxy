import fs from 'node:fs'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {DEFAULT_FIXTURE_DIR, dropBoxes, hlsFragmentOrder} from '../../scripts/ffmpeg-matrix/generate-fixtures.js'
import {classifyProcessEnd, describeFailure, formatReport, verifyProbe, type CaseResult} from '../../scripts/ffmpeg-matrix/outcome.js'
import {buildCases, chapterMetadataFile, containerHolds, expectationFor, FIXTURE_FILES, HLS_PLAYLIST, planInvocation, pythonFloat, quoteForFfmpeg, removeSegmentConcatSpec, type MatrixCase} from '../../scripts/ffmpeg-matrix/remuxMatrix.js'

const layout = {fixtures: path.join(path.sep, 'fx'), work: path.join(path.sep, 'work')}
const fx = (name: string): string => path.join(layout.fixtures, name)
const work = (name: string): string => path.join(layout.work, name)

function find(id: string): MatrixCase {
	const found = buildCases().find(matrixCase => matrixCase.id === id)
	if (!found) throw new Error(`no case ${id}`)
	return found
}

describe('remux matrix cases', () => {
	const cases = buildCases()

	it('gives every case a unique id and runs each dependency first', () => {
		const seen = new Set<string>()
		for (const matrixCase of cases) {
			expect(seen.has(matrixCase.id)).toBe(false)
			for (const need of matrixCase.needs) expect(seen.has(need), `${matrixCase.id} needs ${need}`).toBe(true)
			seen.add(matrixCase.id)
		}
	})

	it('covers the VP9 HLS + AAC to MP4 merge and cut that crashed N-125070', () => {
		expect(find('merge/vp9-hls+aac.mp4').needs).toEqual([])
		expect(find('section-hls/vp9-hls+aac.mp4').needs).toEqual([])
	})

	it('only pairs codecs a container can hold', () => {
		for (const matrixCase of cases) {
			if (matrixCase.step === 'thumbnail-convert') continue
			expect(containerHolds(matrixCase.container, matrixCase.video.codec, matrixCase.audio.codec)).toBe(true)
		}
		expect(containerHolds('webm', 'h264', 'opus')).toBe(false)
		expect(containerHolds('webm', 'vp9', 'aac')).toBe(false)
		expect(containerHolds('mp4', 'vp9', 'opus')).toBe(true)
	})

	it('merges every video with every audio into each container that holds them', () => {
		const merges = cases.filter(matrixCase => matrixCase.step === 'merge').map(matrixCase => matrixCase.id)
		// 4 videos x 2 audios into MP4 and MKV, plus the three VP9/AV1 + Opus WebMs.
		expect(merges).toHaveLength(19)
		expect(merges).toContain('merge/av1-dash+opus.webm')
	})

	it('cuts HLS video from its playlist and DASH video from its file', () => {
		const sections = cases.filter(matrixCase => matrixCase.step === 'section' || matrixCase.step === 'section-hls')
		for (const matrixCase of sections) {
			if (matrixCase.step === 'thumbnail-convert') continue
			expect(matrixCase.step).toBe(matrixCase.video.id === 'vp9-hls' ? 'section-hls' : 'section')
		}
	})

	it('embeds no thumbnail into WebM, as yt-dlp refuses to', () => {
		const thumbnails = cases.filter(matrixCase => matrixCase.step === 'thumbnail' || matrixCase.step === 'app-cover-extract' || matrixCase.step === 'app-subtitles-cover')
		expect(thumbnails.length).toBeGreaterThan(0)
		for (const matrixCase of thumbnails) if (matrixCase.step !== 'thumbnail-convert') expect(matrixCase.container).not.toBe('webm')
	})
})

describe('remux matrix argv', () => {
	it('merges like FFmpegMergerPP', () => {
		const invocation = planInvocation(find('merge/vp9-hls+aac.mp4'), layout)
		expect(invocation.argv).toEqual(['-y', '-loglevel', 'repeat+info', '-i', `file:${fx('vp9-hls.mp4')}`, '-i', `file:${fx('aac-dash.m4a')}`, '-c', 'copy', '-map', '0:v:0', '-map', '1:a:0', '-movflags', '+faststart', `file:${work('merge__vp9-hls+aac.temp.mp4')}`])
	})

	it('cuts a section like FFmpegFD, reading the HLS playlist directly', () => {
		const invocation = planInvocation(find('section-hls/vp9-hls+aac.mp4'), layout)
		const range = ['-ss', '0.5', '-t', '1.0']
		expect(invocation.argv).toEqual(['-y', '-hide_banner', ...range, '-i', fx(HLS_PLAYLIST), ...range, '-i', fx('aac-dash.m4a'), '-c', 'copy', '-map', '0:0', '-map', '1:0', '-f', 'mp4', `file:${work('section-hls__vp9-hls+aac.mp4.part')}`])
	})

	it('names the matroska muxer for an MKV section', () => {
		expect(planInvocation(find('section/h264-dash+aac.mkv'), layout).argv).toContain('matroska')
	})

	it('removes a segment through the concat demuxer like ModifyChaptersPP', () => {
		const invocation = planInvocation(find('remove-chapters/h264-dash+aac.mp4'), layout)
		const spec = `${work('remove-chapters__h264-dash+aac.temp.mp4')}.concat`
		expect(invocation.files).toEqual([{path: spec, content: removeSegmentConcatSpec(work('merge__h264-dash+aac.temp.mp4'), {start: 0.5, end: 1}, 2)}])
		expect(invocation.argv).toEqual(['-y', '-loglevel', 'repeat+info', '-hide_banner', '-nostdin', '-f', 'concat', '-safe', '0', '-i', `file:${spec}`, '-map', '0', '-dn', '-ignore_unknown', '-c', 'copy', '-c:s', 'mov_text', '-movflags', '+faststart', `file:${work('remove-chapters__h264-dash+aac.temp.mp4')}`])
	})

	it('writes the concat spec with inpoint and outpoint around the removed segment', () => {
		expect(removeSegmentConcatSpec('/m.mp4', {start: 0.5, end: 1}, 2)).toBe("ffconcat version 1.0\nfile 'file:/m.mp4'\noutpoint 0.500000\nfile 'file:/m.mp4'\ninpoint 1.000000\n")
		expect(removeSegmentConcatSpec('/m.mp4', {start: 0, end: 1}, 2)).toBe("ffconcat version 1.0\nfile 'file:/m.mp4'\ninpoint 1.000000\n")
	})

	it('adds metadata and chapters like FFmpegMetadataPP, attaching the info.json only to MKV', () => {
		const mp4 = planInvocation(find('metadata/vp9-hls+aac.mp4'), layout)
		expect(mp4.argv.slice(0, 7)).toEqual(['-y', '-loglevel', 'repeat+info', '-i', `file:${work('merge__vp9-hls+aac.temp.mp4')}`, '-i', `file:${work('metadata__vp9-hls+aac.meta')}`])
		expect(mp4.argv).toEqual(expect.arrayContaining(['-map_metadata', '1', '-write_id3v1', '1', '-metadata:s:1', 'language=eng']))
		expect(mp4.argv).not.toContain('-attach')
		const mkv = planInvocation(find('metadata/vp9-hls+aac.mkv'), layout)
		expect(mkv.argv).toEqual(expect.arrayContaining(['-attach', `file:${work('metadata__vp9-hls+aac.info.json')}`, '-metadata:s:2', 'mimetype=application/json']))
	})

	it('converts the thumbnail like FFmpegThumbnailsConvertorPP', () => {
		expect(planInvocation(find('thumbnail-convert/webp-to-jpg'), layout).argv).toEqual(['-y', '-loglevel', 'repeat+info', '-f', 'image2', '-pattern_type', 'none', '-i', `file:${fx('thumbnail.webp')}`, '-update', '1', '-bsf:v', 'mjpeg2jpeg', '-movflags', '+faststart', `file:${work('thumbnail.jpg')}`])
	})

	it('embeds the thumbnail as an attachment in MKV and an attached picture in MP4', () => {
		const mkv = planInvocation(find('thumbnail/h264-dash+aac.mkv'), layout).argv
		expect(mkv).toEqual(expect.arrayContaining(['-attach', `file:${work('thumbnail.jpg')}`, '-metadata:s:2', 'filename=cover.jpg']))
		const mp4 = planInvocation(find('thumbnail/h264-dash+aac.mp4'), layout).argv
		expect(mp4).toEqual(expect.arrayContaining(['-i', `file:${work('thumbnail.jpg')}`, '-map', '1', '-disposition:2', 'attached_pic']))
	})

	it('embeds subtitles like FFmpegEmbedSubtitlePP, as mov_text only in MP4', () => {
		const mp4 = planInvocation(find('subtitles/vp9-hls+aac.mp4'), layout).argv
		expect(mp4).toEqual(expect.arrayContaining(['-c:s', 'mov_text', '-map', '-0:s', '-map', '1:0', '-metadata:s:s:0', 'language=eng']))
		expect(planInvocation(find('subtitles/vp9-dash+opus.webm'), layout).argv).not.toContain('mov_text')
	})

	it("runs Arroxy's own subtitle mux on the yt-dlp output", () => {
		const argv = planInvocation(find('app-subtitles-cover/vp9-hls+aac.mp4'), layout).argv
		expect(argv.slice(0, 5)).toEqual(['-y', '-i', work('thumbnail__vp9-hls+aac.temp.mp4'), '-i', fx('subtitles.en.srt')])
		expect(argv).toEqual(expect.arrayContaining(['-attach', work('app-cover-extract__vp9-hls+aac.muxing-cover.jpg'), '-c:s', 'srt']))
		expect(argv.at(-1)).toBe(work('app-subtitles-cover__vp9-hls+aac.muxing.mkv'))
	})
})

describe('yt-dlp formatting helpers', () => {
	it('quotes like _quote_for_ffmpeg', () => {
		expect(quoteForFfmpeg('file:/a b.mp4')).toBe("'file:/a b.mp4'")
		expect(quoteForFfmpeg("it's")).toBe("'it'\\''s'")
		expect(quoteForFfmpeg("'x'")).toBe("\\''x'\\'")
	})

	it('formats seconds like str(float)', () => {
		expect(pythonFloat(1)).toBe('1.0')
		expect(pythonFloat(0.5)).toBe('0.5')
	})

	it('escapes FFMETADATA chapter titles', () => {
		expect(chapterMetadataFile([{start: 0, end: 1.5, title: 'a=b;c#d\\e'}])).toBe(';FFMETADATA1\n[CHAPTER]\nTIMEBASE=1/1000\nSTART=0\nEND=1500\ntitle=a\\=b\\;c\\#d\\\\e\n')
	})
})

describe('remux matrix outcomes', () => {
	it('treats exit 0 as success and names other exits', () => {
		expect(classifyProcessEnd({code: 0, signal: null, timedOut: false})).toBeUndefined()
		expect(classifyProcessEnd({code: 234, signal: null, timedOut: false})).toEqual({kind: 'exit', code: 234})
	})

	it('reports a POSIX crash by its signal', () => {
		const failure = classifyProcessEnd({code: null, signal: 'SIGSEGV', timedOut: false})
		expect(failure && describeFailure(failure)).toBe('signal SIGSEGV')
	})

	it('reports a Windows crash by its NTSTATUS, signed or unsigned', () => {
		for (const code of [0xc0000005, -1073741819]) {
			const failure = classifyProcessEnd({code, signal: null, timedOut: false})
			expect(failure && describeFailure(failure)).toBe('crash 0xC0000005 STATUS_ACCESS_VIOLATION')
		}
		const unknown = classifyProcessEnd({code: 0xc0001234, signal: null, timedOut: false})
		expect(unknown && describeFailure(unknown)).toBe('crash 0xC0001234')
	})

	it('reports timeouts and spawn errors before any exit status', () => {
		expect(classifyProcessEnd({code: null, signal: 'SIGKILL', timedOut: true})).toEqual({kind: 'timeout'})
		expect(classifyProcessEnd({code: null, signal: null, timedOut: false, spawnError: 'ENOENT'})).toEqual({kind: 'spawn', message: 'ENOENT'})
	})
})

function probe(streams: unknown[], format: Record<string, unknown> = {duration: '2.02'}, chapters: unknown[] = []): string {
	return JSON.stringify({streams, format, chapters})
}

const vp9 = {codec_type: 'video', codec_name: 'vp9', disposition: {attached_pic: 0}}
const aac = {codec_type: 'audio', codec_name: 'aac', disposition: {attached_pic: 0}}
const cover = {codec_type: 'video', codec_name: 'mjpeg', disposition: {attached_pic: 1}}

describe('remux matrix output checks', () => {
	const merge = expectationFor(find('merge/vp9-hls+aac.mp4'))

	it('accepts a merged file with one video and one audio stream of the full length', () => {
		expect(verifyProbe(merge, probe([vp9, aac]))).toEqual([])
	})

	it('rejects a missing stream, a wrong codec and a truncated file', () => {
		expect(verifyProbe(merge, probe([vp9]))).toEqual(['expected one aac audio stream, got none'])
		expect(verifyProbe(merge, probe([{...vp9, codec_name: 'h264'}, aac]))).toEqual(['expected one vp9 video stream, got h264'])
		expect(verifyProbe(merge, probe([vp9, aac], {duration: '0.4'}))[0]).toMatch(/^duration 0.4 s/)
	})

	it('counts cover art apart from the video stream', () => {
		const thumbnail = expectationFor(find('thumbnail/vp9-hls+aac.mp4'))
		expect(verifyProbe(thumbnail, probe([vp9, aac, cover]))).toEqual([])
		expect(verifyProbe(thumbnail, probe([vp9, aac]))).toEqual(['no mjpeg cover art'])
		expect(verifyProbe(merge, probe([vp9, aac, cover]))).toEqual(['unexpected cover art'])
	})

	it('checks the subtitle codec and language', () => {
		const subtitles = expectationFor(find('subtitles/vp9-hls+aac.mp4'))
		const movText = {codec_type: 'subtitle', codec_name: 'mov_text', tags: {language: 'eng'}}
		expect(verifyProbe(subtitles, probe([vp9, aac, movText]))).toEqual([])
		expect(verifyProbe(subtitles, probe([vp9, aac, {...movText, tags: {language: 'und'}}]))).toEqual(['expected one mov_text subtitle in eng, got mov_text (und)'])
	})

	it('checks the title and chapter count, matching tag names in any case', () => {
		const metadata = expectationFor(find('metadata/vp9-dash+opus.webm'))
		const opus = {...aac, codec_name: 'opus'}
		expect(verifyProbe(metadata, probe([vp9, opus], {duration: '2.0', tags: {TITLE: 'Arroxy remux matrix'}}, [{}, {}]))).toEqual([])
		expect(verifyProbe(metadata, probe([vp9, opus], {duration: '2.0', tags: {title: 'Arroxy remux matrix'}}, [{}]))).toEqual(['1 chapters, expected 2'])
	})

	it('rejects output that is not ffprobe JSON', () => {
		expect(verifyProbe(merge, 'garbage')).toEqual(['ffprobe printed no JSON'])
		expect(verifyProbe(merge, '{"streams": 3}')[0]).toMatch(/^unexpected ffprobe JSON/)
	})
})

describe('remux matrix report', () => {
	it('summarizes, lists failures first and escapes table cells', () => {
		const results: CaseResult[] = [
			{id: 'merge/a', status: 'pass'},
			{id: 'merge/b', status: 'fail', stage: 'ffmpeg', detail: 'signal SIGSEGV', log: 'last | line'},
			{id: 'metadata/b', status: 'blocked', by: 'merge/b'}
		]
		const report = formatReport('Matrix', results)
		expect(report).toContain('❌ 1 passed, 1 failed, 1 blocked')
		expect(report.indexOf('### Failures')).toBeLessThan(report.indexOf('| Case | Result |'))
		expect(report).toContain('| `merge/b` | failed in ffmpeg: signal SIGSEGV |')
		expect(report).toContain('| `metadata/b` | blocked by merge/b |')
	})
})

describe('remux matrix fixtures', () => {
	const fixture = (name: string): string => path.join(DEFAULT_FIXTURE_DIR, name)

	it('are committed, and small', () => {
		for (const name of [...Object.values(FIXTURE_FILES), HLS_PLAYLIST]) {
			expect(fs.statSync(fixture(name)).size, name).toBeLessThan(64 * 1024)
		}
	})

	it('include the HLS file the way the native downloader writes it: the init segment and every media segment, concatenated', () => {
		const hlsDir = path.dirname(fixture(HLS_PLAYLIST))
		const fragments = hlsFragmentOrder(fs.readFileSync(fixture(HLS_PLAYLIST), 'utf8'))
		expect(fragments[0]).toBe('init.mp4')
		expect(fragments.length).toBeGreaterThan(2)
		expect(fs.readFileSync(fixture(FIXTURE_FILES.vp9Hls)).equals(Buffer.concat(fragments.map(name => fs.readFileSync(path.join(hlsDir, name)))))).toBe(true)
	})

	it("lay out HLS media segments as YouTube's bare moof+mdat pairs", () => {
		const hlsDir = path.dirname(fixture(HLS_PLAYLIST))
		const [, ...segments] = hlsFragmentOrder(fs.readFileSync(fixture(HLS_PLAYLIST), 'utf8'))
		for (const segment of segments) {
			const data = fs.readFileSync(path.join(hlsDir, segment))
			const types: string[] = []
			for (let offset = 0; offset < data.length; offset += data.readUInt32BE(offset)) types.push(data.toString('latin1', offset + 4, offset + 8))
			expect(types, segment).toEqual(['moof', 'mdat'])
		}
	})
})

describe('fixture generator helpers', () => {
	function box(type: string, body: Buffer): Buffer {
		const header = Buffer.alloc(8)
		header.writeUInt32BE(body.length + 8, 0)
		header.write(type, 4, 'latin1')
		return Buffer.concat([header, body])
	}

	it('drops nested boxes and resizes their parents', () => {
		const input = Buffer.concat([box('ftyp', Buffer.from('iso5')), box('moov', Buffer.concat([box('mvhd', Buffer.alloc(4)), box('udta', Buffer.alloc(12))]))])
		const expected = Buffer.concat([box('ftyp', Buffer.from('iso5')), box('moov', box('mvhd', Buffer.alloc(4)))])
		expect(dropBoxes(input, ['moov/udta']).equals(expected)).toBe(true)
	})

	it('rejects a box that runs past its parent', () => {
		const bad = box('moov', Buffer.alloc(4))
		bad.writeUInt32BE(64, 0)
		expect(() => dropBoxes(bad, [])).toThrow(/malformed box moov/)
	})

	it('orders HLS fragments init first, then playlist order', () => {
		expect(hlsFragmentOrder('#EXTM3U\n#EXT-X-MAP:URI="init.mp4"\n#EXTINF:0.5,\na.m4s\n#EXTINF:0.5,\nb.m4s\n#EXT-X-ENDLIST\n')).toEqual(['init.mp4', 'a.m4s', 'b.m4s'])
		expect(() => hlsFragmentOrder('#EXTM3U\na.ts\n')).toThrow(/EXT-X-MAP/)
	})
})

