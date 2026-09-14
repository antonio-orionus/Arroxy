import type {FileTransport} from 'electron-log'

// Large enough to hold a busy playlist session once progress redraws are no
// longer logged line by line; the previous file survives one rotation as
// main.old.log, so the history on disk is up to twice this.
export const LOG_FILE_MAX_BYTES = 5 * 1024 * 1024

export interface LogFileOptions {
	logPath: string
	/** Called once a rotation has finished, to restate the session context at the top of the new file. */
	onRotated: () => void
	/** Test seam; defaults to setImmediate. */
	defer?: (fn: () => void) => void
}

type ConfigurableFileTransport = Pick<FileTransport, 'archiveLogFn' | 'maxSize' | 'resolvePathFn'>

export function configureLogFile(file: ConfigurableFileTransport, {logPath, onRotated, defer = fn => setImmediate(fn)}: LogFileOptions): void {
	file.resolvePathFn = () => logPath
	file.maxSize = LOG_FILE_MAX_BYTES
	// Keep electron-log's own archive (rename to main.old.log, crop on failure).
	// The context line cannot be written from in here: electron-log archives,
	// resets the file, and only then writes the message that triggered rotation,
	// so logging now would re-enter the transport before the reset.
	const archive = file.archiveLogFn
	file.archiveLogFn = oldFile => {
		archive(oldFile)
		defer(onRotated)
	}
}
