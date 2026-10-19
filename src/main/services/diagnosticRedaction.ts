import {redactText} from 'yt-dlp-bridge/redaction'

// yt-dlp's switch for unredacted debug logs must never reach a log that leaves the machine.
const ALWAYS_REDACT = {}

// Scrubs what a log must not carry once it leaves the machine: the account name
// inside user folder paths and credential-like values. yt-dlp-bridge's redactText
// owns the yt-dlp secrets (PoT and visitor values, bearer and cookie headers,
// signed-URL sig/signature/expire); the rest are app-side names. Shared by the
// feedback upload and the diagnostics file so both publish the same thing.
export function redactDiagnosticLog(value: string): string {
	return redactText(
		value
			.replace(/\/home\/[^/\s]+/g, '/home/<user>')
			.replace(/\/Users\/[^/\s]+/g, '/Users/<user>')
			// Windows paths are case-insensitive, so `c:\users\` names an account as well as `C:\Users\` does.
			.replace(/([A-Z]:\\Users\\)[^\\\r\n]+/gi, '$1<user>')
			.replace(/([?&](?:access_)?token=)[^&\s]+/gi, '$1<redacted>')
			.replace(/([?&](?:api_)?key=)[^&\s]+/gi, '$1<redacted>')
			.replace(/([?&](?:password|passwd|secret|session|auth|cookie)=)[^&\s]+/gi, '$1<redacted>')
			// googlevideo carries the PoT token and a second signature as `pot` and `lsig`.
			.replace(/([?&](?:pot|lsig)=)[^&\s]+/gi, '$1<redacted>'),
		'<redacted>',
		ALWAYS_REDACT
	)
}
