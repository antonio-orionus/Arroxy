import {clsx, type ClassValue} from 'clsx'
import {twMerge} from 'tailwind-merge'
import type {CommonSettings} from '@shared/types.js'

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
