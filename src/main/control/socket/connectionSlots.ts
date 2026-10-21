// Connection slots on the control socket. Handshakes and sessions are
// counted apart: an unauthenticated connection costs a handshake slot for at
// most 2 s, and when those are all taken the oldest handshake is dropped to
// admit the new connection. On Windows another OS user can open the pipe
// read-only and hold connections without ever sending a byte; this way they
// cannot lock out a client the user allowed.

export interface SlotSocket {
	destroy(): void
	once(event: 'close', listener: () => void): unknown
}

export interface ConnectionLimits {
	readonly sessions: number
	readonly handshakes: number
}

export class ConnectionSlots<S extends SlotSocket = SlotSocket> {
	// In arrival order, so the first is the oldest.
	private readonly handshakes = new Set<S>()
	private readonly sessions = new Set<S>()

	constructor(private readonly limits: ConnectionLimits) {}

	admit(socket: S): void {
		if (this.handshakes.size >= this.limits.handshakes) {
			const [oldest] = this.handshakes
			if (oldest) {
				this.handshakes.delete(oldest)
				oldest.destroy()
			}
		}
		this.handshakes.add(socket)
		socket.once('close', () => {
			this.handshakes.delete(socket)
			this.sessions.delete(socket)
		})
	}

	// Auth succeeded: false when every session slot is taken.
	promote(socket: S): boolean {
		if (!this.handshakes.has(socket) || this.sessions.size >= this.limits.sessions) return false
		this.handshakes.delete(socket)
		this.sessions.add(socket)
		return true
	}

	closeAll(): void {
		for (const socket of [...this.handshakes, ...this.sessions]) socket.destroy()
	}
}
