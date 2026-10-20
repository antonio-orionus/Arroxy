// The real title of a downloaded video, read from the info-json yt-dlp wrote
// for the job. yt-dlp writes the title as extracted; only the filename is
// sanitized and trimmed to fit the name budget, so a placeholder row is named
// from here rather than from the landed file.
import {readFile} from 'node:fs/promises'
import {z} from 'zod'

const infoJsonTitleSchema = z.object({title: z.string()}).loose()

// yt-dlp output read back from disk, so it is parsed rather than trusted. A
// missing or unreadable file, or one without a usable title, gives null.
export async function readInfoJsonTitle(path: string): Promise<string | null> {
	const text = await readFile(path, 'utf8').catch(() => null)
	if (text === null) return null
	let raw: unknown
	try {
		raw = JSON.parse(text)
	} catch {
		return null
	}
	const parsed = infoJsonTitleSchema.safeParse(raw)
	const title = parsed.success ? parsed.data.title.trim() : ''
	return title === '' ? null : title
}
