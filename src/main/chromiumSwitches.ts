export interface ChromiumCommandLine {
	appendSwitch(name: string, value?: string): void
}

export interface RuntimeIdentity {
	platform: NodeJS.Platform
	release: string
}

export interface ChromiumSwitchLogSummary {
	switchNames: string[]
	count: number
}

export function chromiumSwitchLogSummary(rawSwitches: readonly string[]): ChromiumSwitchLogSummary {
	return {switchNames: rawSwitches.map(rawSwitch => rawSwitch.split('=')[0]).filter(Boolean), count: rawSwitches.length}
}

export function applyChromiumSwitches(rawSwitches: readonly string[], commandLine: ChromiumCommandLine): string[] {
	const applied: string[] = []
	for (const rawSwitch of rawSwitches) {
		const [name, ...valueParts] = rawSwitch.split('=')
		if (!name) continue
		const value = valueParts.join('=')
		commandLine.appendSwitch(name, value || undefined)
		applied.push(rawSwitch)
	}

	return applied
}

export function applyChromiumSwitchesFromEnv(env: {ARROXY_CHROMIUM_SWITCHES?: string | undefined}, commandLine: ChromiumCommandLine): string[] {
	const rawSwitches = env.ARROXY_CHROMIUM_SWITCHES?.trim()
	if (!rawSwitches) return []
	return applyChromiumSwitches(rawSwitches.split(/\s+/), commandLine)
}

export function chromiumSwitchesForRuntime(runtime: RuntimeIdentity): string[] {
	const majorDarwinVersion = Number.parseInt(runtime.release.split('.')[0] ?? '', 10)
	if (runtime.platform === 'darwin' && majorDarwinVersion >= 25) {
		return ['disable-features=AudioServiceOutOfProcess']
	}
	return []
}
