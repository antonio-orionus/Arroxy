import fs from 'node:fs/promises'
import path from 'node:path'
import {redactDiagnosticLog} from './diagnosticRedaction.js'

export interface DiagnosticsFileInput {
	/** The active log; its rotated sibling (`<name>.old<ext>`) is included when present. */
	logPath: string
	outputDir: string
	/** Session context at the moment of export — already free of credentials. */
	context: Record<string, unknown>
	now?: Date
}

// One file a user can attach to a bug report: the session context followed by
// both log files, oldest first, redacted the same way as the feedback upload.
// Rotation keeps only one previous file, so together they are the whole history
// on disk.
export async function writeDiagnosticsFile({logPath, outputDir, context, now = new Date()}: DiagnosticsFileInput): Promise<string> {
	const parsed = path.parse(logPath)
	const oldLogPath = path.join(parsed.dir, `${parsed.name}.old${parsed.ext}`)
	const [oldLog, currentLog] = await Promise.all([readIfPresent(oldLogPath), readIfPresent(logPath)])

	const content = [
		'Arroxy diagnostics',
		`Generated: ${now.toISOString()}`,
		'User folder names and URL secrets are redacted. Video links and titles are kept.',
		'',
		'== Session context ==',
		JSON.stringify(context, null, 2),
		'',
		`== ${path.basename(oldLogPath)} ==`,
		oldLog ?? '(not present)',
		'',
		`== ${path.basename(logPath)} ==`,
		currentLog ?? '(not present)'
	].join('\n')

	const filePath = path.join(outputDir, `arroxy-diagnostics-${fileStamp(now)}.txt`)
	await fs.writeFile(filePath, redactDiagnosticLog(content), 'utf8')
	return filePath
}

async function readIfPresent(filePath: string): Promise<string | null> {
	try {
		return await fs.readFile(filePath, 'utf8')
	} catch (error) {
		if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
		throw error
	}
}

// UTC, so two exports in the same second collide predictably rather than
// depending on the machine's time zone: 2026-09-14T10:20:30Z → 20260914-102030.
function fileStamp(now: Date): string {
	const iso = now.toISOString()
	return `${iso.slice(0, 10).replaceAll('-', '')}-${iso.slice(11, 19).replaceAll(':', '')}`
}
