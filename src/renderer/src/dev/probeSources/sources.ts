// The sites whose real probes are kept as fixtures (`bun run
// probe-sources:capture`). Each is here for a shape of format list the Format
// screen has to handle; add one when a site breaks the picker.
export interface ProbeSource {
	id: string
	url: string
	// What this source exercises, for the Scenario Workbench card.
	shows: string
	// Captured signed in, with the dev profile's Explore session: its YouTube
	// cookies (an age-restricted video, a members-only one...), or, for any
	// other site, every cookie but Google's and YouTube's account cookies, as
	// the app's own jar for that site.
	signIn?: 'youtube' | 'web'
}

export const PROBE_SOURCES = [
	{id: 'youtube-multilang', url: 'https://www.youtube.com/watch?v=RE3_PGwDwhw', shows: 'YouTube with several audio languages, DRC twins, AV1/VP9/H.264 at most heights'},
	{id: 'youtube-8k-hdr', url: 'https://www.youtube.com/watch?v=KxMqSz8qVSg', shows: 'YouTube up to 4320p, HDR10 and SDR, 60 fps, AV1/VP9/VP9.2/H.264'},
	{id: 'youtube-2014', url: 'https://www.youtube.com/watch?v=OPf0YbXqDm0', shows: 'A 2014 music video: 1080p tops, low-fps storyboard-like streams'},
	{id: 'youtube-2010', url: 'https://www.youtube.com/watch?v=OQSNhk5ICTI', shows: 'A 2010 upload: 480p tops, odd frame rates (13 and 25 fps)'},
	{id: 'youtube-2007', url: 'https://www.youtube.com/watch?v=_OBlgSz8sSM', shows: 'A 2007 upload: YouTube adds AI-upscaled 720p and 1080p (-sr) above the original 480p'},
	{id: 'youtube-2005', url: 'https://www.youtube.com/watch?v=jNQXAC9IVRw', shows: 'The first YouTube video: 240p tops'},
	{id: 'youtube-short', url: 'https://www.youtube.com/shorts/zinYqcm70zk', shows: 'A vertical Short: 1080x1920, plus a 608x1080 stream that rounds to 480p beside 480x854'},
	{id: 'youtube-autodub', url: 'https://www.youtube.com/watch?v=XIAzwtSjIq0', shows: 'YouTube AI auto-dubbed audio tracks ("dubbed-auto") beside the original'},
	{id: 'youtube-vr', url: 'https://www.youtube.com/watch?v=dQMTPqws3Xg', shows: 'A 360° video: equirectangular projection on every stream'},
	{id: 'youtube-premium', url: 'https://www.youtube.com/watch?v=i_GrYOruY7w', shows: 'A "Premium" enhanced-bitrate 1080p (616) offered signed out'},
	{id: 'youtube-age-restricted', url: 'https://www.youtube.com/watch?v=Tq92D6wQ1mg', shows: 'Age-restricted, probed signed in through the embedded player: H.264 and VP9 only, 1080p tops', signIn: 'youtube'},
	{id: 'youtube-dolby', url: 'https://www.youtube.com/watch?v=ee9i6oMqShk', shows: 'A trailer with Dolby Digital and Dolby Digital Plus 5.1 beside stereo AAC and Opus'},
	{id: 'youtube-music', url: 'https://music.youtube.com/watch?v=dQw4w9WgXcQ', shows: 'A YouTube Music link'},
	{id: 'youtube-podcast', url: 'https://www.youtube.com/watch?v=s7d2d8FhevU', shows: 'A 3.6-hour YouTube podcast episode'},
	{id: 'twitch-clip', url: 'https://www.twitch.tv/twitch/clip/ObedientAssiduousNikudonCclamChamp-c8MYDuWjmyTjxxzb', shows: 'A Twitch clip: portrait and landscape copies of each height'},
	{id: 'bandcamp', url: 'https://c418.bandcamp.com/track/sweden', shows: 'A Bandcamp track: one MP3 stream'},
	{id: 'dailymotion', url: 'https://www.dailymotion.com/video/x7tgad0', shows: 'Muxed HLS only, sizes estimated from bitrate'},
	{id: 'vk', url: 'https://vk.com/video-77521_162222515', shows: 'DASH video-only and muxed MP4s of the same height, codec named on some only'},
	{id: 'archive', url: 'https://archive.org/details/BigBuckBunny_124', shows: 'No codec names: one file type per height (avi, mp4, ogv)'},
	{id: 'streamable', url: 'https://streamable.com/moo', shows: 'One muxed MP4 with no size or bitrate'},
	{id: 'bitchute', url: 'https://www.bitchute.com/video/UGlrF9o9b-Q/', shows: 'One stream with no resolution at all'},
	{id: 'soundcloud', url: 'https://soundcloud.com/forss/flickermood', shows: 'Audio-only site'},
	{id: 'tiktok', url: 'https://www.tiktok.com/@meister12347/video/6934396727596240134', shows: 'TikTok: bytevc1 and H.264 at the same heights, several bitrates each'},
	{id: 'instagram', url: 'https://www.instagram.com/p/DebnOR3N4hf/', shows: 'Instagram: VP9 DASH with bitrates but no duration (no size estimate), and three combined MP4s with no details at all'},
	{id: 'facebook', url: 'https://www.facebook.com/reel/2218259845769232/', shows: 'A Facebook reel, signed in: AV1 DASH at several bitrates per height, and distinct sd and hd MP4s with no details at all', signIn: 'web'}
] as const satisfies readonly ProbeSource[]

export type ProbeSourceId = (typeof PROBE_SOURCES)[number]['id']
