const SECRET_PATTERNS = [
	/(po_token=)([^,\s;]+)/gi,
	/(visitor_data=)([^,\s;]+)/gi,
	/(password=)([^,\s;]+)/gi,
	/(access[_-]?token=)([^,\s;&]+)/gi,
	/(refresh[_-]?token=)([^,\s;&]+)/gi,
	/(Authorization:\s*Bearer\s+)([A-Za-z0-9._~+/-]+)/gi,
	/(Cookie:\s*)(.+)$/gim,
	/([?&](?:sig|signature|token|key|auth|expire|expires|X-Amz-Signature)=)([^&\s]+)/gi
]

const SECRET_FLAGS = new Set(['--password', '-p', '--twofactor', '-2', '--video-password', '--ap-password', '--client-certificate-password', '--netrc-cmd', '--add-headers', '--cookies', '--cookies-from-browser'])

interface RedactionEnv {
	NODE_ENV?: string
}

function isDevelopment(env: RedactionEnv): boolean {
	return env.NODE_ENV === 'development'
}

export function redactText(value: string, replacement = '[REDACTED]', env: RedactionEnv = process.env): string {
	if (isDevelopment(env)) return value
	return SECRET_PATTERNS.reduce((text, pattern) => text.replace(pattern, `$1${replacement}`), value)
}

export function redactArgs(args: string[], env: RedactionEnv = process.env): string[] {
	if (isDevelopment(env)) return [...args]

	const redacted: string[] = []
	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index] ?? ''
		const flagName = arg.includes('=') ? arg.slice(0, arg.indexOf('=')) : arg
		if (flagName === '--proxy') {
			if (arg.includes('=')) redacted.push(`${flagName}=${redactProxy(arg.slice(arg.indexOf('=') + 1))}`)
			else {
				redacted.push(arg)
				if (index + 1 < args.length) {
					redacted.push(redactProxy(args[index + 1] ?? ''))
					index += 1
				}
			}
			continue
		}
		if (SECRET_FLAGS.has(flagName)) {
			if (arg.includes('=')) redacted.push(`${flagName}=[REDACTED]`)
			else {
				redacted.push(arg)
				if (index + 1 < args.length) {
					redacted.push('[REDACTED]')
					index += 1
				}
			}
		} else {
			redacted.push(redactText(arg))
		}
	}
	return redacted
}

function redactProxy(value: string): string {
	try {
		const url = new URL(value)
		if (url.username) url.username = '***'
		if (url.password) url.password = '***'
		return url.toString()
	} catch {
		return '<unparseable>'
	}
}

export function excerpt(value: string, maxLength = 1200, env: RedactionEnv = process.env): string {
	const cleaned = redactText(value.trim(), '[REDACTED]', env)
	if (isDevelopment(env)) return cleaned
	return cleaned.length <= maxLength ? cleaned : `${cleaned.slice(0, maxLength)}...`
}
