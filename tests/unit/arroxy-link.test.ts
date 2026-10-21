import {describe, expect, it} from 'vite-plus/test'
import {arroxyLinkArgs, buildArroxyLink, parseArroxyLink} from '@main/linkScheme/arroxyLink.js'

const VIDEO = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

function link(query: string, head = 'arroxy://open'): string {
	return `${head}${query}`
}

describe('parseArroxyLink', () => {
	it('takes the one web link an open link carries', () => {
		expect(parseArroxyLink(link(`?url=${encodeURIComponent(VIDEO)}`))).toEqual({ok: true, url: VIDEO})
		expect(parseArroxyLink(link('?url=http%3A%2F%2Fexample.com%2Fclip'))).toEqual({ok: true, url: 'http://example.com/clip'})
	})

	it('accepts the trailing slash and letter case browsers and shells add', () => {
		expect(parseArroxyLink(link(`?url=${encodeURIComponent(VIDEO)}`, 'arroxy://open/'))).toEqual({ok: true, url: VIDEO})
		expect(parseArroxyLink(link(`?url=${encodeURIComponent(VIDEO)}`, 'ARROXY://Open'))).toEqual({ok: true, url: VIDEO})
	})

	it('keeps the whole link, punctuation included', () => {
		for (const url of ['https://example.com/video,part2.mp4', 'https://example.com/watch?token=abc;def', "https://example.com/a'b|c"]) {
			expect(parseArroxyLink(buildArroxyLink(url))).toEqual({ok: true, url})
		}
	})

	it('round-trips the links it builds', () => {
		const tricky = 'https://example.com/watch?v=1&list=PL2#t=30'
		expect(parseArroxyLink(buildArroxyLink(tricky))).toEqual({ok: true, url: tricky})
	})

	it.each([
		['another scheme', `https://open?url=${encodeURIComponent(VIDEO)}`, 'wrongScheme'],
		['no url at all', 'arroxy://open', 'wrongParams'],
		['an empty url', 'arroxy://open?url=', 'notAWebLink'],
		['another action', `arroxy://download?url=${encodeURIComponent(VIDEO)}`, 'wrongAction'],
		['a path after the action', `arroxy://open/now?url=${encodeURIComponent(VIDEO)}`, 'wrongAction'],
		['two urls', `arroxy://open?url=${encodeURIComponent(VIDEO)}&url=${encodeURIComponent(VIDEO)}`, 'wrongParams'],
		['an extra parameter', `arroxy://open?url=${encodeURIComponent(VIDEO)}&folder=%2Ftmp`, 'wrongParams'],
		['credentials', `arroxy://me:secret@open?url=${encodeURIComponent(VIDEO)}`, 'extraParts'],
		['a port', `arroxy://open:80?url=${encodeURIComponent(VIDEO)}`, 'extraParts'],
		['a fragment', `arroxy://open?url=${encodeURIComponent(VIDEO)}#x`, 'extraParts'],
		['a file url', `arroxy://open?url=${encodeURIComponent('file:///etc/passwd')}`, 'notAWebLink'],
		['a javascript url', `arroxy://open?url=${encodeURIComponent('javascript:alert(1)')}`, 'notAWebLink'],
		['a nested arroxy link', `arroxy://open?url=${encodeURIComponent(buildArroxyLink(VIDEO))}`, 'notAWebLink'],
		['text around the link', `arroxy://open?url=${encodeURIComponent(`watch ${VIDEO}`)}`, 'notAWebLink'],
		['two links in one value', `arroxy://open?url=${encodeURIComponent(`${VIDEO} ${VIDEO}`)}`, 'notAWebLink'],
		['no url syntax at all', 'arroxy:open', 'wrongAction'],
		['garbage', 'not a link', 'notAUrl']
	])('rejects %s', (_name, raw, reason) => {
		expect(parseArroxyLink(raw)).toEqual({ok: false, reason})
	})

	it('rejects a link too long to be one a person clicked', () => {
		const longVideo = `https://example.com/${'a'.repeat(9000)}`
		expect(parseArroxyLink(buildArroxyLink(longVideo))).toEqual({ok: false, reason: 'tooLong'})
	})
})

describe('arroxyLinkArgs', () => {
	it('finds the link among the arguments the OS passed, wherever Chromium put it', () => {
		const opened = buildArroxyLink(VIDEO)
		expect(arroxyLinkArgs(['C:\\Arroxy\\Arroxy.exe', '--', opened])).toEqual([opened])
		expect(arroxyLinkArgs(['/app/arroxy.bin', opened, '--no-sandbox'])).toEqual([opened])
		expect(arroxyLinkArgs(['/app/arroxy.bin', 'ARROXY://open?url=x'])).toEqual(['ARROXY://open?url=x'])
	})

	it('ignores every other argument', () => {
		expect(arroxyLinkArgs(['/Applications/Arroxy.app/Contents/MacOS/Arroxy', '--inspect=0', 'out/main/index.js', VIDEO, 'arroxyish'])).toEqual([])
	})
})
