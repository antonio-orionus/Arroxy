// A task the pipeline starts and does not wait for (a background probe, a
// toast's action, a retry after the Explore sign-in). Main answers a refused
// command with a fail result, so a rejection is the IPC transport itself: it
// is reported here rather than left as an unhandled rejection.
export function detach(task: Promise<unknown>, what: string): void {
	task.catch((error: unknown) => {
		console.error(`[quick-download] ${what} failed`, error)
	})
}
