// Newline-delimited frames off the control socket, counted in bytes. Each
// line's cap depends on its position (the handshake's lines are capped
// tighter than the session's). A frame longer than its cap, a buffer that
// grows past the next line's cap with no newline, or a line that is not
// UTF-8 is an error: the caller drops the connection.

export type FramesPushed = {readonly ok: true; readonly lines: readonly string[]} | {readonly ok: false; readonly reason: 'oversized' | 'encoding'}

const NEWLINE = 0x0a

export class LineFrames {
	private pending: Buffer = Buffer.alloc(0)
	// Non-blank lines handed out so far.
	private count = 0
	private readonly decoder = new TextDecoder('utf-8', {fatal: true})

	// `capFor(index)`: the most bytes the index-th non-blank line may carry.
	constructor(private readonly capFor: (index: number) => number) {}

	push(chunk: Buffer): FramesPushed {
		// `pending` never exceeds a cap, so this copy stays bounded.
		let buffer = this.pending.length === 0 ? chunk : Buffer.concat([this.pending, chunk])
		const lines: string[] = []
		let newline = buffer.indexOf(NEWLINE)
		while (newline !== -1) {
			if (newline > this.capFor(this.count)) return {ok: false, reason: 'oversized'}
			let line: string
			try {
				line = this.decoder.decode(buffer.subarray(0, newline))
			} catch {
				return {ok: false, reason: 'encoding'}
			}
			if (line.trim() !== '') {
				lines.push(line)
				this.count++
			}
			buffer = buffer.subarray(newline + 1)
			newline = buffer.indexOf(NEWLINE)
		}
		if (buffer.length > this.capFor(this.count)) return {ok: false, reason: 'oversized'}
		this.pending = Buffer.from(buffer)
		return {ok: true, lines}
	}
}
