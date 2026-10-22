// The queue's global pause, qBittorrent-style: while `paused` the
// auto-scheduler starts nothing; an explicit per-item start or resume still
// spawns directly. `userPaused` is the flag the user set: the renderer shows
// it and the queue file keeps it. A silent hold (the cancel-all sweep, quitting)
// moves only `paused`, so it never reaches the renderer or the next launch.
export class QueueSchedulerPause {
	paused = false
	userPaused = false

	constructor(private readonly onChange: (paused: boolean) => void) {}

	// Boot: the flag the queue file kept.
	restore(paused: boolean): void {
		this.paused = paused
		this.userPaused = paused
	}

	// Reports a real, non-silent change through onChange.
	set(paused: boolean, opts?: {silent?: boolean}): void {
		if (this.paused === paused) return
		this.paused = paused
		if (opts?.silent) return
		this.userPaused = paused
		this.onChange(paused)
	}
}
