import {HOMEBREW_CASK} from '@shared/constants.js'
import type {InstallChannel, UpdateAvailablePayload} from '@shared/types.js'

// `runnable` commands also get a Run button: the main process executes the
// matching upgrade itself. Copy-only commands are ones the app cannot run.
// `homebrewCommand` rides next to a download: a DMG install on a Mac that has
// brew can move under Homebrew while updating (the command is always run by
// the main process, never taken from here).
export type Action = {kind: 'install'} | {kind: 'download'; homebrewCommand?: string} | {kind: 'command'; cmd: string; runnable: boolean}
type BannerMessageKey = 'update.message.generic' | 'update.message.homebrew' | 'update.message.macosDirect' | 'update.message.macosDirectHomebrew' | 'update.message.portable'
type BannerButtonKey = 'update.downloadDmg'

export interface BannerCopy {
	messageKey: BannerMessageKey
	buttonKey?: BannerButtonKey
}

export function resolveAction(channel: InstallChannel, platform: NodeJS.Platform, homebrewAvailable = false): Action {
	switch (channel) {
		case 'scoop':
			return {kind: 'command', cmd: 'scoop update arroxy', runnable: false}
		case 'homebrew':
			return {kind: 'command', cmd: 'brew upgrade --cask arroxy', runnable: true}
		case 'winget':
			return {kind: 'install'}
		case 'portable':
			return {kind: 'download'}
		case 'direct':
			if (platform !== 'darwin') return {kind: 'install'}
			return homebrewAvailable ? {kind: 'download', homebrewCommand: `brew install --cask --force ${HOMEBREW_CASK}`} : {kind: 'download'}
		// Arroxy's Flatpak repo serves updates; the sandboxed app cannot replace
		// its own files, so the user runs the update.
		case 'flatpak':
			return {kind: 'command', cmd: 'flatpak update io.github.antonio_orionus.Arroxy', runnable: false}
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
	if (info.installChannel === 'direct' && platform === 'darwin') return {messageKey: info.homebrewAvailable ? 'update.message.macosDirectHomebrew' : 'update.message.macosDirect', buttonKey: 'update.downloadDmg'}
	return {messageKey: 'update.message.generic'}
}
