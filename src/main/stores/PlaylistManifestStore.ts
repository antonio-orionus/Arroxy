import Store from 'electron-store'
import type {PlaylistManifest} from '@shared/playlistManifest.js'
import {playlistManifestSchema} from '@shared/schemas.js'

interface ManifestData {
	byGroup: Record<string, PlaylistManifest>
}

export class PlaylistManifestStore {
	private readonly store: Store<ManifestData>

	constructor(userDataPath: string) {
		this.store = new Store<ManifestData>({name: 'playlist-manifests', cwd: userDataPath, defaults: {byGroup: {}}, clearInvalidConfig: true})
	}

	async save(manifest: PlaylistManifest): Promise<void> {
		const parsed = playlistManifestSchema.safeParse(manifest)
		if (!parsed.success) {
			throw new Error(`PlaylistManifestStore.save: invalid manifest — ${parsed.error.issues[0]?.message ?? 'schema mismatch'}`)
		}
		const byGroup = {...this.store.get('byGroup'), [parsed.data.playlistGroupId]: parsed.data}
		this.store.set('byGroup', byGroup)
	}

	get(playlistGroupId: string): PlaylistManifest | null {
		const byGroup = this.store.get('byGroup')
		if (typeof byGroup !== 'object' || byGroup === null || Array.isArray(byGroup)) {
			return null
		}
		const raw = byGroup[playlistGroupId]
		if (!raw) return null
		const parsed = playlistManifestSchema.safeParse(raw)
		return parsed.success ? parsed.data : null
	}

	async remove(playlistGroupId: string): Promise<void> {
		const byGroup = {...this.store.get('byGroup')}
		delete byGroup[playlistGroupId]
		this.store.set('byGroup', byGroup)
	}
}
