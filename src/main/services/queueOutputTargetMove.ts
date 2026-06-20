import {randomUUID} from 'node:crypto'
import {mkdir, unlink, writeFile} from 'node:fs/promises'
import {join} from 'node:path'
import {fail, ok, type Result} from '@shared/result.js'
import {canApplyQueueActionToItem} from '@shared/queueActions.js'
import {createAppError} from '@main/utils/errorFactory.js'
import type {QueueActionSkippedItem, QueueItem, QueueOutputTargetChangeItemResult, QueueOutputTargetChangeResult} from '@shared/types.js'

type QueueItemPatcher = (item: QueueItem) => QueueItem

export interface QueueOutputTargetMoveHost {
	findItem(itemId: string): QueueItem | undefined
	patchItem(itemId: string, reason: string, patcher: QueueItemPatcher): void
}

function changeSingleOutputTarget(host: QueueOutputTargetMoveHost, item: QueueItem, outputDir: string): {itemResult: QueueOutputTargetChangeItemResult} | {skipped: QueueActionSkippedItem} {
	if (!canApplyQueueActionToItem('change-output-target', item)) {
		return {skipped: {itemId: item.id, status: item.status, reason: 'invalid-status'}}
	}

	const itemResult: QueueOutputTargetChangeItemResult = {itemId: item.id, moved: [], missing: []}
	host.patchItem(item.id, 'changeOutputTarget', prev => ({...prev, outputDir}))
	return {itemResult}
}

async function ensureWritableDirectory(outputDir: string): Promise<Result<void>> {
	try {
		await mkdir(outputDir, {recursive: true})
		const probePath = join(outputDir, `.arroxy-write-test-${process.pid}-${randomUUID()}`)
		await writeFile(probePath, '')
		await unlink(probePath)
		return ok(undefined)
	} catch (error) {
		return fail(createAppError('validation', `outputDir is not writable: ${error instanceof Error ? error.message : String(error)}`))
	}
}

export async function changeQueueOutputTarget(host: QueueOutputTargetMoveHost, itemIds: string[], outputDir: string): Promise<Result<QueueOutputTargetChangeResult>> {
	const nextOutputDir = outputDir.trim()
	if (!nextOutputDir) return fail(createAppError('validation', 'outputDir is required'))

	const items: QueueOutputTargetChangeItemResult[] = []
	const skipped: QueueActionSkippedItem[] = []
	const applicableItemIds: string[] = []

	for (const itemId of itemIds) {
		const item = host.findItem(itemId)
		if (!item) {
			skipped.push({itemId, reason: 'not-found'})
			continue
		}
		if (!canApplyQueueActionToItem('change-output-target', item)) {
			skipped.push({itemId: item.id, status: item.status, reason: 'invalid-status'})
			continue
		}
		applicableItemIds.push(item.id)
	}

	if (applicableItemIds.length === 0) return ok({outputDir: nextOutputDir, items, skipped})

	const writable = await ensureWritableDirectory(nextOutputDir)
	if (!writable.ok) return fail(writable.error)

	for (const itemId of applicableItemIds) {
		const item = host.findItem(itemId)
		if (!item) {
			skipped.push({itemId, reason: 'not-found'})
			continue
		}
		const result = changeSingleOutputTarget(host, item, nextOutputDir)
		if ('skipped' in result) {
			skipped.push(result.skipped)
			continue
		}

		items.push(result.itemResult)
	}

	return ok({outputDir: nextOutputDir, items, skipped})
}
