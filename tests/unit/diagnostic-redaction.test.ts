import {describe, expect, it} from 'vite-plus/test'
import {redactDiagnosticLog} from '@main/services/diagnosticRedaction.js'

// Diagnostics leave the machine (feedback upload, a file attached to a public
// issue), so the account name inside a user folder path must never survive.
describe('redactDiagnosticLog', () => {
	it('removes the account name from Windows user paths whatever the drive letter case', () => {
		expect(redactDiagnosticLog('C:\\Users\\Alice Smith\\Downloads')).toBe('C:\\Users\\<user>\\Downloads')
		expect(redactDiagnosticLog('c:\\Users\\alice\\Downloads')).toBe('c:\\Users\\<user>\\Downloads')
		expect(redactDiagnosticLog('D:\\users\\alice\\Videos')).toBe('D:\\users\\<user>\\Videos')
	})

	it('removes the account name from macOS and Linux home paths', () => {
		expect(redactDiagnosticLog('/Users/alice/Downloads and /home/bob/Videos')).toBe('/Users/<user>/Downloads and /home/<user>/Videos')
	})

	it('removes credential-like URL query values', () => {
		expect(redactDiagnosticLog('https://example.com/a?token=abc&api_key=def&cookie=ghi&v=1')).toBe('https://example.com/a?token=<redacted>&api_key=<redacted>&cookie=<redacted>&v=1')
	})

	// googlevideo stream URLs carry the signature, its expiry and the PoT
	// token as query values; any of them ties a log to a session.
	it('removes signed media URL query values', () => {
		expect(redactDiagnosticLog('https://rr1.googlevideo.com/videoplayback?expire=1760000000&sig=AOq0Q&itag=18&pot=MnQx&lsig=AG3C')).toBe('https://rr1.googlevideo.com/videoplayback?expire=<redacted>&sig=<redacted>&itag=18&pot=<redacted>&lsig=<redacted>')
		expect(redactDiagnosticLog('https://cdn.example.com/v.mp4?signature=abc&expires=123&X-Amz-Signature=def')).toBe('https://cdn.example.com/v.mp4?signature=<redacted>&expires=<redacted>&X-Amz-Signature=<redacted>')
	})

	it('removes PoT and visitor values passed as yt-dlp extractor args', () => {
		expect(redactDiagnosticLog('--extractor-args youtube:po_token=web.gvs+MnQx;visitor_data=CgtA')).toBe('--extractor-args youtube:po_token=<redacted>;visitor_data=<redacted>')
	})
})
