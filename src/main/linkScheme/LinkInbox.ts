import {arroxyLinkArgs, parseArroxyLink} from './arroxyLink.js'

export type LinkSource = 'open-url' | 'launch' | 'second-instance'

export interface LinkInboxLog {
	info(message: string, meta: Record<string, string>): void
	warn(message: string, meta: Record<string, string>): void
}

export interface LinkInboxTarget {
	// Brings the window forward and sends the link to the renderer.
	deliver(url: string): void
}

// Holds an `arroxy://` link until the renderer can take it. macOS sends the
// link that launched the app before `ready`, and a cold start's command line
// is read before the window exists, so a link waits for both the window and
// the renderer's listener; like the copied link, only the newest one waits.
// Rejected links are dropped with a log line naming the reason, never the link.
export class LinkInbox {
	private pending: string | null = null
	private target: LinkInboxTarget | null = null
	private ready = false

	constructor(private readonly log: LinkInboxLog) {}

	receive(raw: string, via: LinkSource): void {
		const parsed = parseArroxyLink(raw)
		if (!parsed.ok) {
			this.log.warn('arroxy link ignored', {via, reason: parsed.reason})
			return
		}
		this.log.info('arroxy link received', {via})
		this.pending = parsed.url
		this.flush()
	}

	receiveArgv(argv: readonly string[], via: LinkSource): void {
		const links = arroxyLinkArgs(argv)
		if (links.length === 0) return
		if (links.length > 1) {
			this.log.warn('arroxy link ignored', {via, reason: 'severalLinks'})
			return
		}
		this.receive(links[0] ?? '', via)
	}

	attach(target: LinkInboxTarget): void {
		this.target = target
		this.flush()
	}

	rendererReady(): void {
		this.ready = true
		this.flush()
	}

	// A reload drops the renderer's listener; links wait for the next one.
	rendererGone(): void {
		this.ready = false
	}

	private flush(): void {
		if (this.pending === null || !this.target || !this.ready) return
		const url = this.pending
		this.pending = null
		this.target.deliver(url)
	}
}
