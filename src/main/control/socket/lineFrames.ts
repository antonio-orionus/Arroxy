// Newline-delimited frames off the control socket, counted in bytes. A frame
// longer than the cap, a buffer that grows past it with no newline, or a
// line that is not UTF-8 is an error: the caller drops the connection.

export type FramesPushed = {readonly ok: true; readonly lines: readonly string[]} | {readonly ok: false; readonly reason: 'oversized' | 'encoding'}

const NEWLINE = 0x0a

export class LineFrames {
	private pending: Buffer = Buffer.alloc(0)
	private readonly decoder = new TextDecoder('utf-8', {fatal: true})

	constructor(private maxBytes: number) {}

	// After auth the cap rises from the handshake's to the session's.
	raiseMaxBytes(maxBytes: number): void {
		this.maxBytes = Math.max(this.maxBytes, maxBytes)
	}

	push(chunk: Buffer): FramesPushed {
		// `pending` never exceeds the cap, so this copy stays bounded.
		let buffer = this.pending.length === 0 ? chunk : Buffer.concat([this.pending, chunk])
		const lines: string[] = []
		let newline = buffer.indexOf(NEWLINE)
		while (newline !== -1) {
			if (newline > this.maxBytes) return {ok: false, reason: 'oversized'}
			let line: string
			try {
				line = this.decoder.decode(buffer.subarray(0, newline))
			} catch {
				return {ok: false, reason: 'encoding'}
			}
			if (line.trim() !== '') lines.push(line)
			buffer = buffer.subarray(newline + 1)
			newline = buffer.indexOf(NEWLINE)
		}
		if (buffer.length > this.maxBytes) return {ok: false, reason: 'oversized'}
		this.pending = Buffer.from(buffer)
		return {ok: true, lines}
	}
}
