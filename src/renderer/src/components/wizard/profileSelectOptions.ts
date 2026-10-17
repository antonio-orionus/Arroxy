import type {ParseKeys, TFunction} from 'i18next'

export interface SelectOption<T extends string> {
	value: T
	labelKey: ParseKeys
	labelValues?: Record<string, string>
	disabled?: boolean
}

export function optionLabel<T extends string>(t: TFunction, options: readonly SelectOption<T>[], value: unknown): string {
	const selected = options.find(option => option.value === value)
	if (selected) return t(selected.labelKey, selected.labelValues)
	return typeof value === 'string' ? value : ''
}
