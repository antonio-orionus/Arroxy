import type {SupportedLang} from './schemas.js'
import {INSTALL_CHANNELS, type InstallChannel} from './types.js'

// Facts about the machine and install the renderer cannot read for itself. The
// sandboxed preload sees `process.arch` and `process.getSystemVersion()`, but
// the install channel needs the filesystem and the system language needs the
// OS's preferred languages (`navigator.language` is Chromium's clamped locale),
// so main passes them as launch arguments (`webPreferences.additionalArguments`)
// and the preload reads argv.
export interface RuntimeInfo {
	arch: string
	osVersion: string
	installChannel: InstallChannel | null
	// The app language main picked from the OS's preferred languages, unvalidated:
	// the preload may not load the language list (it would bundle zod), so the
	// renderer narrows it. Null when main passed none (the browser-mock renderer).
	systemLanguage: string | null
}

const INSTALL_CHANNEL_ARG_PREFIX = '--arroxy-install-channel='
const SYSTEM_LANGUAGE_ARG_PREFIX = '--arroxy-system-language='

export function installChannelArg(channel: InstallChannel): string {
	return `${INSTALL_CHANNEL_ARG_PREFIX}${channel}`
}

export function parseInstallChannelArg(argv: readonly string[]): InstallChannel | null {
	const value = argv.find(arg => arg.startsWith(INSTALL_CHANNEL_ARG_PREFIX))?.slice(INSTALL_CHANNEL_ARG_PREFIX.length)
	return INSTALL_CHANNELS.find(channel => channel === value) ?? null
}

export function systemLanguageArg(lang: SupportedLang): string {
	return `${SYSTEM_LANGUAGE_ARG_PREFIX}${lang}`
}

export function parseSystemLanguageArg(argv: readonly string[]): string | null {
	const value = argv.find(arg => arg.startsWith(SYSTEM_LANGUAGE_ARG_PREFIX))?.slice(SYSTEM_LANGUAGE_ARG_PREFIX.length)
	return value === undefined || value === '' ? null : value
}
