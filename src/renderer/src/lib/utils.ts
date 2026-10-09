import {clsx, type ClassValue} from 'clsx'
import {extendTailwindMerge} from 'tailwind-merge'
import type {CommonSettings} from '@shared/types.js'

// Register the custom scale from styles.css (`--text-*`, `--shadow-*`). Unknown
// `text-*` classes otherwise merge as colours, so `cn('text-label', 'text-muted-foreground')`
// would silently drop the font size.
const twMerge = extendTailwindMerge({extend: {theme: {text: ['label', 'caption', 'body', 'title', 'headline', 'display'], shadow: ['glow', 'selected']}}})

export function cn(...inputs: ClassValue[]): string {
	return twMerge(clsx(inputs))
}

export function formatHomeRelativePath(absPath: string, commonPaths: CommonSettings['commonPaths']): string {
	const home = commonPaths?.home
	if (!home) return absPath
	const sep = home.includes('/') ? '/' : '\\'
	if (absPath === home) return '~'
	const prefix = home + sep
	return absPath.startsWith(prefix) ? '~' + sep + absPath.slice(prefix.length) : absPath
}
