import {ipcMain} from 'electron'
import type {LocalClientRegistry} from '@main/control/clients/LocalClientRegistry.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {type LocalClientsAllowInput, localClientsAllowSchema, type LocalClientsDenyInput, localClientsDenySchema, type LocalClientsError, type LocalClientsRefusal, type LocalClientsRemoveInput, localClientsRemoveSchema} from '@shared/localClients.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {AppError} from '@shared/types.js'
import {handle, handleRaw} from './utils.js'

// The window's way to the local clients (release flag agentControl): it lists
// them and the requests waiting for Allow, answers those, removes a client,
// and hears every change as a fresh snapshot. Registered by startAgentControl
// once the registry is loaded, and taken away when it stops, so a release
// build never has these channels.

type LocalClients = Pick<LocalClientRegistry, 'snapshot' | 'allow' | 'deny' | 'remove' | 'onChange'>

// The app window, as far as pushing a change to it goes.
export interface LocalClientsWindow {
	isDestroyed(): boolean
	readonly webContents: {send(channel: string, ...args: unknown[]): void}
}

const REFUSALS: Record<LocalClientsRefusal, string> = {not_pending: 'That request was already answered or has expired.', secure_storage_unavailable: 'Secrets cannot be stored encrypted on this computer, so the client was not allowed.', unknown_client: 'That client is not allowed, or was removed already.'}

type Answer = Result<void, LocalClientsError | AppError>

function refused(code: LocalClientsRefusal): Answer {
	return fail({code, message: REFUSALS[code]})
}

// Answers what takes the handlers and the change listener away again.
export function registerLocalClientHandlers(clients: LocalClients, window: LocalClientsWindow): () => void {
	handleRaw(IPC_CHANNELS.localClientsGet, () => ok(clients.snapshot()))
	handle<LocalClientsAllowInput, void, LocalClientsError | AppError>(IPC_CHANNELS.localClientsAllow, localClientsAllowSchema, ({approvalId, pathsRead}) => {
		const allowed = clients.allow(approvalId, {pathsRead})
		return Promise.resolve(allowed.ok ? ok(undefined) : refused(allowed.code))
	})
	handle<LocalClientsDenyInput, void, LocalClientsError | AppError>(IPC_CHANNELS.localClientsDeny, localClientsDenySchema, ({approvalId}) => Promise.resolve(clients.deny(approvalId) ? ok(undefined) : refused('not_pending')))
	handle<LocalClientsRemoveInput, void, LocalClientsError | AppError>(IPC_CHANNELS.localClientsRemove, localClientsRemoveSchema, ({clientId}) => Promise.resolve(clients.remove(clientId) ? ok(undefined) : refused('unknown_client')))
	const stopPushing = clients.onChange(() => {
		if (!window.isDestroyed()) window.webContents.send(IPC_CHANNELS.localClientsChanged, clients.snapshot())
	})
	return () => {
		stopPushing()
		for (const channel of [IPC_CHANNELS.localClientsGet, IPC_CHANNELS.localClientsAllow, IPC_CHANNELS.localClientsDeny, IPC_CHANNELS.localClientsRemove]) ipcMain.removeHandler(channel)
	}
}
