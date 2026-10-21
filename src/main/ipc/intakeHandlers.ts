import {IPC_CHANNELS} from '@shared/ipc.js'
import {ok} from '@shared/result.js'
import {intakeAddInputSchema, intakeChooseInputSchema, intakeItemInputSchema, intakeRetryInputSchema, intakeWindowContextSchema} from '@shared/intake/intakeSchemas.js'
import type {IntakeService} from '@main/intake/IntakeService.js'
import {handle} from './utils.js'

// The window's way into link intake. Every call it makes is the window's own
// (origin `window`); the hotkey and outside callers reach IntakeService in main.
export function registerIntakeHandlers(intake: Pick<IntakeService, 'add' | 'retry' | 'choose' | 'keptProbe' | 'setWindowContext'>): void {
	handle(IPC_CHANNELS.intakeCmdAdd, intakeAddInputSchema, async request => ok(await intake.add({...request, origin: {kind: 'window'}})))
	handle(IPC_CHANNELS.intakeCmdRetry, intakeRetryInputSchema, call => Promise.resolve(intake.retry({...call, origin: 'window'})))
	handle(IPC_CHANNELS.intakeCmdChoose, intakeChooseInputSchema, call => Promise.resolve(intake.choose({...call, origin: 'window'})))
	handle(IPC_CHANNELS.intakeCmdKeptProbe, intakeItemInputSchema, ({itemId}) => Promise.resolve(ok(intake.keptProbe(itemId))))
	handle(IPC_CHANNELS.intakeCmdSetWindowContext, intakeWindowContextSchema, context => {
		intake.setWindowContext(context)
		return Promise.resolve(ok(undefined))
	})
}
