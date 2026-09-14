import {describe, expect, it} from 'vitest'
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
})
