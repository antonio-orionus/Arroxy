// The one answer to "is this a YouTube host?" for URLs. yt-dlp's YoutubeIE
// accepts youtube-nocookie.com embeds, so they get every YouTube behavior too.
// Cookie domains are a different question (see onYouTube in youtube.ts).
export function isYouTubeHostname(hostname: string): boolean {
	const host = hostname.toLowerCase()
	return host === 'youtu.be' || host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtube-nocookie.com' || host.endsWith('.youtube-nocookie.com')
}
