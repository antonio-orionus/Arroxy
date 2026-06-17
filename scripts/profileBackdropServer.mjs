const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost', '::1'])

export function profileBackdropServerCommand(platform = process.platform) {
	return platform === 'win32' ? 'bun.exe' : 'bun'
}

export function profileBackdropStopCommand(pid, platform = process.platform) {
	if (platform !== 'win32') return null
	return {command: 'taskkill.exe', args: ['/PID', String(pid), '/T', '/F']}
}

export function profileBackdropServerEnv(url, baseEnv = process.env) {
	const parsed = new URL(url)
	if (!LOCAL_HOSTS.has(parsed.hostname) || !parsed.port) {
		throw new Error('Auto-start requires a URL with an explicit local renderer port, such as http://127.0.0.1:5173/.')
	}

	const port = Number(parsed.port)
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`Invalid renderer port in profile URL: ${parsed.port}`)
	}

	return {...baseEnv, ARROXY_RENDERER_PORT: String(port)}
}
