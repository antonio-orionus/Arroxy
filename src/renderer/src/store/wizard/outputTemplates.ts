export function singleOutputTemplate(includeId: boolean): string {
	return includeId ? '%(title).200B [%(id)s].%(ext)s' : '%(title).200B.%(ext)s'
}

export function playlistOutputTemplate(): string {
	return '%(title).200B [%(id)s].%(ext)s'
}
