// Scrubs what a log must not carry once it leaves the machine: the account name
// inside user folder paths and credential-like URL query values. Shared by the
// feedback upload and the diagnostics file so both publish the same thing.
export function redactDiagnosticLog(value: string): string {
	return value
		.replace(/\/home\/[^/\s]+/g, '/home/<user>')
		.replace(/\/Users\/[^/\s]+/g, '/Users/<user>')
		.replace(/[A-Z]:\\Users\\[^\\\r\n]+/g, 'C:\\Users\\<user>')
		.replace(/([?&](?:access_)?token=)[^&\s]+/gi, '$1<redacted>')
		.replace(/([?&](?:api_)?key=)[^&\s]+/gi, '$1<redacted>')
		.replace(/([?&](?:password|passwd|secret|session|auth|cookie)=)[^&\s]+/gi, '$1<redacted>')
}
