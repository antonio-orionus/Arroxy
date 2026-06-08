export interface PlaylistManifestItem {
	videoId: string | null
	title: string
	duration?: number
}

export interface PlaylistManifest {
	playlistGroupId: string
	playlistTitle: string
	outputDir: string
	items: PlaylistManifestItem[] // FULL ordered probe list (not just selected)
}
