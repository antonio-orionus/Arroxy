import type {LocalClientRegistry} from '@main/control/clients/LocalClientRegistry.js'
import type {LocalClientsHolder} from '@main/control/startAgentControl.js'
import {IPC_CHANNELS} from '@shared/ipc.js'
import {type LocalClientsAllowInput, localClientsAllowSchema, type LocalClientsDenyInput, localClientsDenySchema, type LocalClientsError, type LocalClientsRefusal, type LocalClientsRemoveInput, localClientsRemoveSchema} from '@shared/localClients.js'
import {isReleaseFlagOn} from '@shared/releaseFlags.js'
import {fail, ok, type Result} from '@shared/result.js'
import type {AppError} from '@shared/types.js'
import {handle, handleRaw} from './utils.js'

// The window's way to the local clients (release flag agentControl): it lists
// them and the requests waiting for Allow, answers those, removes a client,
// and hears every change as a fresh snapshot. Registered at start-up, before
// agent control loads the clients, so every call gets a Result: not_running
// until startAgentControl sets the registry, and again once it clears it
// (stopped, or failed to start). A release build registers none of these
// channels.

type LocalClients = Pick<LocalClientRegistry, 'snapshot' | 'allow' | 'deny' | 'remove' | 'onChange'>

// The app window, as far as pushing a change to it goes.
export interface LocalClientsWindow {
	isDestroyed(): boolean
	readonly webContents: {send(channel: string, ...args: unknown[]): void}
}

const REFUSALS: Record<LocalClientsRefusal, string> = {
	not_pending: 'That request was already answered or has expired.',
	secure_storage_unavailable: 'Secrets cannot be stored encrypted on this computer, so the client was not allowed.',
	unknown_client: 'That client is not allowed, or was removed already.',
	not_running: 'Agent control is not running, so there are no local clients to show or change.'
}

type Answer<T = void> = Result<T, LocalClientsError | AppError>

function refused(code: LocalClientsRefusal): Answer<never> {
	return fail({code, message: REFUSALS[code]})
}

const OFF: LocalClientsHolder = {set: () => undefined, clear: () => undefined}

// Answers the holder agent control sets the loaded clients in. With the flag
// off nothing is registered, and the holder it answers ignores what it is given.
export function registerLocalClientHandlers(window: LocalClientsWindow): LocalClientsHolder {
	if (!isReleaseFlagOn('agentControl')) return OFF
	let clients: LocalClients | null = null
	let stopPushing = (): void => undefined
	// The answer from the clients set, or not_running.
	const answer = <T>(fn: (current: LocalClients) => Answer<T>): Promise<Answer<T>> => Promise.resolve(clients === null ? refused('not_running') : fn(clients))
	handleRaw(IPC_CHANNELS.localClientsGet, () => answer(current => ok(current.snapshot())))
	handle<LocalClientsAllowInput, void, LocalClientsError | AppError>(IPC_CHANNELS.localClientsAllow, localClientsAllowSchema, ({approvalId, pathsRead}) =>
		answer(current => {
			const allowed = current.allow(approvalId, {pathsRead})
			return allowed.ok ? ok(undefined) : refused(allowed.code)
		})
	)
	handle<LocalClientsDenyInput, void, LocalClientsError | AppError>(IPC_CHANNELS.localClientsDeny, localClientsDenySchema, ({approvalId}) => answer(current => (current.deny(approvalId) ? ok(undefined) : refused('not_pending'))))
	handle<LocalClientsRemoveInput, void, LocalClientsError | AppError>(IPC_CHANNELS.localClientsRemove, localClientsRemoveSchema, ({clientId}) => answer(current => (current.remove(clientId) ? ok(undefined) : refused('unknown_client'))))
	const clear = (): void => {
		stopPushing()
		stopPushing = () => undefined
		clients = null
	}
	return {
		set: next => {
			clear()
			clients = next
			stopPushing = next.onChange(() => {
				if (!window.isDestroyed()) window.webContents.send(IPC_CHANNELS.localClientsChanged, next.snapshot())
			})
		},
		clear
	}
}
