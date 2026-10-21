import net from 'node:net'

// One newline-delimited JSON connection to Arroxy's control socket or pipe.
// Lines are handed out in order; a line that is not JSON closes the connection,
// since the Control API never sends one.

interface Waiter {
	readonly resolve: (value: unknown) => void
	readonly reject: (error: Error) => void
}

export class ConnectionClosedError extends Error {
	constructor(message = 'Arroxy closed the connection.') {
		super(message)
		this.name = 'ConnectionClosedError'
	}
}

export class LineConnection {
	private buffer = ''
	private readonly lines: unknown[] = []
	private readonly waiters: Waiter[] = []
	private closedError: Error | null = null

	private constructor(private readonly socket: net.Socket) {
		socket.setEncoding('utf8')
		socket.on('data', (chunk: string) => this.receive(chunk))
		socket.on('error', error => this.close(error))
		socket.on('close', () => this.close(new ConnectionClosedError()))
	}

	// Rejects with the socket error (ENOENT, ECONNREFUSED, ...) when nobody
	// listens, and after timeoutMs when nobody accepts.
	static open(socketPath: string, timeoutMs: number): Promise<LineConnection> {
		return new Promise((resolve, reject) => {
			const socket = net.createConnection(socketPath)
			const onError = (error: Error): void => {
				clearTimeout(timer)
				socket.destroy()
				reject(error)
			}
			const timer = setTimeout(() => onError(new Error(`No answer from ${socketPath} within ${timeoutMs} ms.`)), timeoutMs)
			socket.once('error', onError)
			socket.once('connect', () => {
				clearTimeout(timer)
				socket.off('error', onError)
				resolve(new LineConnection(socket))
			})
		})
	}

	send(message: unknown): void {
		if (this.closedError) throw this.closedError
		this.socket.write(`${JSON.stringify(message)}\n`)
	}

	// The next parsed line.
	next(): Promise<unknown> {
		const line = this.lines.shift()
		if (line !== undefined) return Promise.resolve(line)
		if (this.closedError) return Promise.reject(this.closedError)
		return new Promise((resolve, reject) => this.waiters.push({resolve, reject}))
	}

	close(error: Error = new ConnectionClosedError()): void {
		if (this.closedError) return
		this.closedError = error
		this.socket.destroy()
		for (const waiter of this.waiters.splice(0)) waiter.reject(error)
	}

	private receive(chunk: string): void {
		this.buffer += chunk
		let newline = this.buffer.indexOf('\n')
		while (newline !== -1) {
			const line = this.buffer.slice(0, newline).trim()
			this.buffer = this.buffer.slice(newline + 1)
			newline = this.buffer.indexOf('\n')
			if (line === '') continue
			let parsed: unknown
			try {
				parsed = JSON.parse(line)
			} catch {
				this.close(new ConnectionClosedError('Arroxy sent a line that is not JSON.'))
				return
			}
			const waiter = this.waiters.shift()
			if (waiter) waiter.resolve(parsed)
			else this.lines.push(parsed)
		}
	}
}
