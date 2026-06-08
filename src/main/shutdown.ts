import type {Result} from '@shared/result.js'

interface ShutdownQueueService {
	cancel: (itemId: string | null) => Promise<Result<unknown>>
	pauseAll: () => Promise<void>
}

interface ShutdownTokenService {
	dispose: () => void
}

export interface CancelQueueBeforeExitDeps {
	queueService: ShutdownQueueService
	tokenService: ShutdownTokenService
	logInfo: (message: string, meta?: Record<string, unknown>) => void
	exit: (code: number) => void
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error)
}

export async function cancelQueueBeforeExit({queueService, tokenService, logInfo, exit}: CancelQueueBeforeExitDeps): Promise<void> {
	try {
		const result = await queueService.cancel(null)
		if (!result.ok) {
			logInfo('Queue cancellation before shutdown failed', {error: result.error.message})
		}
	} catch (error) {
		logInfo('Queue cancellation before shutdown failed', {error: errorMessage(error)})
	} finally {
		tokenService.dispose()
		logInfo('App shutting down')
		exit(0)
	}
}
