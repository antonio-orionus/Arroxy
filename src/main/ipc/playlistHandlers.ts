import {promises as fsPromises} from 'node:fs'
import log from 'electron-log/main.js'
import {z} from 'zod'
import {createAppError} from '@main/utils/errorFactory.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {findPlayableFileName} from '@shared/playlistMedia.js'
import {playlistManifestSchema} from '@shared/schemas.js'
import {fail, ok} from '@shared/result.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'
import type {SettingsStore} from '@main/stores/SettingsStore.js'
import {collectPlaylistScanRoots, resolveAllowedOutputDir} from '@main/services/playlistScanPath.js'
import {handle, toUnknownFailure} from './utils.js'

const logger = log.scope('playlist')

const scanInputSchema = z.object({outputDir: z.string().min(1), videoIds: z.array(z.string())})

export async function scanFolderForVideoIds(outputDir: string, videoIds: string[]): Promise<string[]> {
	let names: string[]
	try {
		const entries = await fsPromises.readdir(outputDir, {withFileTypes: true})
		names = entries.flatMap(e => (e.isFile() ? [e.name] : []))
	} catch {
		return []
	}
	return videoIds.filter(id => findPlayableFileName(names, id) !== undefined)
}

export function registerPlaylistHandlers(manifestStore: PlaylistManifestStore, settingsStore: SettingsStore): void {
	handle(IPC_CHANNELS.playlistScanFolder, scanInputSchema, async ({outputDir, videoIds}) => {
		try {
			const roots = collectPlaylistScanRoots(settingsStore.getSync())
			const resolved = await resolveAllowedOutputDir(outputDir, roots)
			if (!resolved.ok) {
				logger.warn('playlist:scanFolder rejected', {outputDir, reason: resolved.message})
				return fail(createAppError('validation', resolved.message))
			}
			return ok({matchedIds: await scanFolderForVideoIds(resolved.path, videoIds)})
		} catch (err) {
			return toUnknownFailure(err)
		}
	})

	handle(IPC_CHANNELS.playlistRegisterManifest, playlistManifestSchema, async manifest => {
		try {
			await manifestStore.save(manifest)
			return ok(undefined)
		} catch (err) {
			return toUnknownFailure(err)
		}
	})
}
