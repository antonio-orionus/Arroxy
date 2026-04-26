import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { AppSettings } from '@shared/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatHomeRelativePath(
  absPath: string,
  commonPaths: AppSettings['commonPaths']
): string {
  const home = commonPaths?.downloads?.replace(/[/\\][^/\\]+$/, '');
  if (!home) return absPath;
  const sep = home.includes('/') ? '/' : '\\';
  if (absPath === home) return '~';
  const prefix = home + sep;
  return absPath.startsWith(prefix) ? '~' + sep + absPath.slice(prefix.length) : absPath;
}
