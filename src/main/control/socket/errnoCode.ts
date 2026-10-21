// The errno code on a Node system error (ENOENT, EADDRINUSE, ...), for logs
// and branching; never the message, which can carry paths.
export function errnoCode(error: unknown): string | undefined {
	return error instanceof Error && 'code' in error && typeof error.code === 'string' ? error.code : undefined
}
