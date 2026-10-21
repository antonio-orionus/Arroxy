import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import {LinkInbox, type LinkInboxLog} from './LinkInbox.js'

export interface LinkSchemeDeps {
	// macOS: Electron's `open-url`, which can fire before `ready`.
	onOpenUrl: (listener: (url: string) => void) => void
	// The launch command line, which carries the link on Windows and Linux.
	argv: readonly string[]
	log: LinkInboxLog
}

// The entry point for `arroxy://` links. Installers register the scheme
// whether or not the flag is on, so with the flag off nothing listens: the
// link only starts or focuses Arroxy.
export function registerLinkScheme({onOpenUrl, argv, log}: LinkSchemeDeps): LinkInbox | null {
	if (!isReleaseFlagOn('linkScheme')) return null
	const inbox = new LinkInbox(log)
	onOpenUrl(url => inbox.receive(url, 'open-url'))
	inbox.receiveArgv(argv, 'launch')
	return inbox
}
