// Serialized `.m3u` writes for playlist groups.
//
// Extracted from QueueService because writing a playlist artifact is a
// side-effect of items completing, not part of being the queue-of-record.
// Owns only the per-group promise chain that keeps concurrent writes to one
// path from racing.

import type {PlaylistManifest} from '@shared/playlistManifest.js'
import type {PlaylistManifestStore} from '@main/stores/PlaylistManifestStore.js'

export interface PlaylistM3uDeps {
	manifestStore: PlaylistManifestStore
	writeM3u: (manifest: PlaylistManifest) => Promise<void>
}

export class QueuePlaylistM3u {
	private readonly chains = new Map<string, Promise<void>>()

	constructor(private readonly deps: PlaylistM3uDeps | undefined) {}

	write(playlistGroupId: string): Promise<void> {
		// Serialize per group: two items in the same playlist can complete in the
		// same tick, so overlapping writeFile() calls would race on one .m3u path.
		// Chaining keeps them sequential (writes are idempotent — file rebuilt from disk).
		const prev = this.chains.get(playlistGroupId) ?? Promise.resolve()
		const next = prev.then(() => this.writeOnce(playlistGroupId))
		const stored = next.catch(() => {})
		this.chains.set(playlistGroupId, stored)
		// Drop the entry once it settles, unless a newer write already replaced it
		// — otherwise the map retains one promise per group for the app's lifetime.
		void stored.finally(() => {
			if (this.chains.get(playlistGroupId) === stored) this.chains.delete(playlistGroupId)
		})
		return next
	}

	private async writeOnce(playlistGroupId: string): Promise<void> {
		if (!this.deps) return
		const manifest = this.deps.manifestStore.get(playlistGroupId)
		if (!manifest) return
		await this.deps.writeM3u(manifest)
	}
}
