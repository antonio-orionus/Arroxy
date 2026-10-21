// Smart TV's selector: each alternative tried with H.264 in MP4, then H.264,
// then as it is (an alternative that already asks for MP4 skips the first).
const H264_VIDEO = "[vcodec~='(?i)^(?:[hx]264|avc)'][format_note!~=?'(?i)\\b(?:damaged|watermarked)\\b']"

export function h264First(selector: string): string {
	return selector
		.split('/')
		.flatMap(alternative => {
			const atom = /^best(?:video)?\*?/.exec(alternative)?.[0] ?? ''
			const rest = alternative.slice(atom.length)
			return rest.startsWith('[ext=mp4]') ? [`${atom}${H264_VIDEO}${rest}`, alternative] : [`${atom}${H264_VIDEO}[ext=mp4]${rest}`, `${atom}${H264_VIDEO}${rest}`, alternative]
		})
		.join('/')
}
