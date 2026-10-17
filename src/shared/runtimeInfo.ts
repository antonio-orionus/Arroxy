import {INSTALL_CHANNELS, type InstallChannel} from './types.js'

// Facts about the machine and install the renderer cannot read for itself. The
// sandboxed preload sees `process.arch` and `process.getSystemVersion()`, but
// the install channel needs the filesystem, so main passes it as a launch
// argument (`webPreferences.additionalArguments`) and the preload reads argv.
export interface RuntimeInfo {
	arch: string
	osVersion: string
	installChannel: InstallChannel | null
}

const INSTALL_CHANNEL_ARG_PREFIX = '--arroxy-install-channel='

export function installChannelArg(channel: InstallChannel): string {
	return `${INSTALL_CHANNEL_ARG_PREFIX}${channel}`
}

export function parseInstallChannelArg(argv: readonly string[]): InstallChannel | null {
	const value = argv.find(arg => arg.startsWith(INSTALL_CHANNEL_ARG_PREFIX))?.slice(INSTALL_CHANNEL_ARG_PREFIX.length)
	return INSTALL_CHANNELS.find(channel => channel === value) ?? null
}
