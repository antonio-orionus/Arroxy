const PRESETS = ['100K', '250K', '500K', '750K', '1M', '1.5M', '2M', '3M', '5M', '10M', '20M', '50M'] as const
export type LimitRatePreset = (typeof PRESETS)[number]

export const LIMIT_RATE_PRESETS: readonly LimitRatePreset[] = PRESETS

export function isLimitRatePreset(value: string | undefined): value is LimitRatePreset {
	return value !== undefined && (PRESETS as readonly string[]).includes(value)
}

const RATE_PATTERN = /^(\d+(?:\.\d+)?)([KM])$/i

export function formatLimitRateLabel(value: string | undefined): string {
	if (value === undefined || value.trim() === '') return ''
	const match = RATE_PATTERN.exec(value)
	if (!match) return value
	const [, num, unit] = match
	return unit.toUpperCase() === 'K' ? `${num} KB/s` : `${num} MB/s`
}
