import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import {LinkInbox, type LinkInboxLog} from './LinkInbox.js'

export interface LinkSchemeDeps {
	// macOS: Electron's `open-url`, which can fire before `ready`.
	onOpenUrl: (listener: (url: string) => void) => void
	// Windows and Linux: a second launch's command line. Listened for now, not
	// once startup is done, so a link opened while Arroxy starts still arrives.
	onSecondInstance: (listener: (argv: readonly string[]) => void) => void
	// The launch command line, which carries the link on Windows and Linux.
	argv: readonly string[]
	log: LinkInboxLog
}

// The entry point for `arroxy://` links. Installers register the scheme only
// once the flag ships; until then a link reaches Arroxy only on a command
// line, and with the flag off nothing listens.
export function registerLinkScheme({onOpenUrl, onSecondInstance, argv, log}: LinkSchemeDeps): LinkInbox | null {
	if (!isReleaseFlagOn('linkScheme')) return null
	const inbox = new LinkInbox(log)
	onOpenUrl(url => inbox.receive(url, 'open-url'))
	onSecondInstance(secondArgv => inbox.receiveArgv(secondArgv, 'second-instance'))
	inbox.receiveArgv(argv, 'launch')
	return inbox
}
