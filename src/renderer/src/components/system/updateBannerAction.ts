import type {InstallChannel, UpdateAvailablePayload} from '@shared/types.js'

export type Action = {kind: 'install'} | {kind: 'download'} | {kind: 'command'; cmd: string}
type BannerMessageKey = 'update.message.generic' | 'update.message.homebrew' | 'update.message.macosDirect' | 'update.message.portable'
type BannerButtonKey = 'update.downloadDmg'

export interface BannerCopy {
	messageKey: BannerMessageKey
	buttonKey?: BannerButtonKey
}

export function resolveAction(channel: InstallChannel, platform: NodeJS.Platform): Action {
	switch (channel) {
		case 'scoop':
			return {kind: 'command', cmd: 'scoop update arroxy'}
		case 'homebrew':
			return {kind: 'command', cmd: 'brew upgrade --cask arroxy'}
		case 'winget':
			return {kind: 'install'}
		case 'portable':
			return {kind: 'download'}
		case 'direct':
			return platform === 'darwin' ? {kind: 'download'} : {kind: 'install'}
		// Flatpak is filtered upstream in the main process — the renderer should
		// never receive this channel. Handled here only for type exhaustiveness.
		case 'flatpak':
			return {kind: 'download'}
		default: {
			// Exhaustiveness check — adding a channel without handling here is a type error.
			const _exhaustive: never = channel
			void _exhaustive
			return {kind: 'download'}
		}
	}
}

export function resolveBannerCopy(info: UpdateAvailablePayload, platform: NodeJS.Platform): BannerCopy {
	if (info.installChannel === 'homebrew') return {messageKey: 'update.message.homebrew'}
	if (info.installChannel === 'portable') return {messageKey: 'update.message.portable'}
	if (info.installChannel === 'direct' && platform === 'darwin') return {messageKey: 'update.message.macosDirect', buttonKey: 'update.downloadDmg'}
	return {messageKey: 'update.message.generic'}
}
