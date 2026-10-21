import {parseArgs} from 'node:util'
import type {ControlMethod} from 'arroxy-control'
import {type ArroxyClient, checkParams, formatFailure} from './client'
import {DEFAULT_WAIT_TIMEOUT_MS} from './tools'
import {ARROXY_MCP_VERSION} from './version'

const USAGE = `Usage: arroxy-mcp [command]

Drives the running Arroxy app. With no command it serves MCP on stdio.

Commands:
  serve                                   Serve MCP on stdio (the default)
  status                                  Show whether Arroxy is ready
  profiles                                List download profiles
  queue [--cursor <c>] [--limit <n>]      List the queue
  add <url> [--profile builtin:<id>|custom:<id>] [--playlist|--video]
        [--request-id <id>]               Add a link (resend --request-id to retry safely)
  get <itemId> | get --intake <intakeId>  Read a queue item or an intake
  wait <itemId> | wait --intake <intakeId> [--until settled|done] [--timeout <ms>]
                                          Wait for it to settle or finish (default ${DEFAULT_WAIT_TIMEOUT_MS} ms)
  pause|resume|cancel|retry|remove <itemId>
  pause-all | resume-all

Options:
  -h, --help       Show this help
  -v, --version    Show the version

Exit codes: 0 done, 1 error, 2 Arroxy is not running.
`

export type ParsedCommand = {readonly kind: 'serve'} | {readonly kind: 'help'} | {readonly kind: 'version'} | {readonly kind: 'usage'; readonly message: string} | {readonly kind: 'call'; readonly method: ControlMethod; readonly params: unknown}

const OPTIONS = {
	help: {type: 'boolean', short: 'h'},
	version: {type: 'boolean', short: 'v'},
	profile: {type: 'string'},
	playlist: {type: 'boolean'},
	video: {type: 'boolean'},
	intake: {type: 'boolean'},
	until: {type: 'string'},
	timeout: {type: 'string'},
	cursor: {type: 'string'},
	limit: {type: 'string'},
	'request-id': {type: 'string'}
} as const

type Values = ReturnType<typeof parseArgs<{options: typeof OPTIONS; allowPositionals: true; strict: true}>>['values']
type OptionName = keyof typeof OPTIONS

const ITEM_COMMANDS = {pause: 'queue.pause', resume: 'queue.resume', cancel: 'queue.cancel', retry: 'queue.retry', remove: 'queue.remove'} as const satisfies Record<string, ControlMethod>

function usage(message: string): ParsedCommand {
	return {kind: 'usage', message}
}

function isItemCommand(command: string): command is keyof typeof ITEM_COMMANDS {
	return Object.hasOwn(ITEM_COMMANDS, command)
}

// Checks params against the method's schema, so a bad flag is a usage error
// rather than a round trip to Arroxy.
function call(method: ControlMethod, params: unknown): ParsedCommand {
	const checked = checkParams(method, params)
	return checked.ok ? {kind: 'call', method, params: checked.params} : usage(checked.message)
}

function integer(text: string | undefined, flag: string): number | string | undefined {
	if (text === undefined) return undefined
	return /^\d+$/.test(text) ? Number(text) : `--${flag} takes a whole number, not "${text}".`
}

function profileRef(text: string): {readonly kind: 'builtin' | 'custom'; readonly id: string} | null {
	const match = /^(builtin|custom):(.+)$/.exec(text)
	if (match === null) return null
	return match[1] === 'builtin' ? {kind: 'builtin', id: match[2] ?? ''} : {kind: 'custom', id: match[2] ?? ''}
}

// Options each command accepts; anything else is a usage error.
const ALLOWED: Readonly<Record<string, readonly OptionName[]>> = {queue: ['cursor', 'limit'], add: ['profile', 'playlist', 'video', 'request-id'], get: ['intake'], wait: ['intake', 'until', 'timeout']}

function unexpectedOption(command: string, values: Values): string | null {
	const allowed = new Set<string>(['help', 'version', ...(ALLOWED[command] ?? [])])
	const extra = Object.keys(values).find(name => !allowed.has(name))
	return extra === undefined ? null : `${command} does not take --${extra}.`
}

export function parseCommand(argv: readonly string[], newRequestId: () => string): ParsedCommand {
	let parsed: {values: Values; positionals: string[]}
	try {
		parsed = parseArgs({args: [...argv], options: OPTIONS, allowPositionals: true, strict: true})
	} catch (error) {
		return usage(error instanceof Error ? error.message : String(error))
	}
	const {values, positionals} = parsed
	if (values.help === true) return {kind: 'help'}
	if (values.version === true) return {kind: 'version'}
	const [command = 'serve', ...rest] = positionals
	const extra = unexpectedOption(command, values)
	if (extra !== null) return usage(extra)
	const expect = (count: number, what: string): string | null => (rest.length === count ? null : `${command} takes ${what}.`)

	switch (command) {
		case 'serve':
		case 'status':
		case 'profiles':
		case 'queue':
		case 'pause-all':
		case 'resume-all': {
			const problem = expect(0, 'no arguments')
			if (problem !== null) return usage(problem)
			if (command === 'serve') return {kind: 'serve'}
			if (command === 'status') return call('status', {})
			if (command === 'profiles') return call('profiles.list', {})
			if (command === 'pause-all') return call('queue.pauseAll', {})
			if (command === 'resume-all') return call('queue.resumeAll', {})
			const limit = integer(values.limit, 'limit')
			if (typeof limit === 'string') return usage(limit)
			return call('queue.list', {cursor: values.cursor, limit})
		}
		case 'add': {
			const problem = expect(1, 'one link')
			if (problem !== null) return usage(problem)
			if (values.playlist === true && values.video === true) return usage('Pass --playlist or --video, not both.')
			let profile: ReturnType<typeof profileRef> | undefined
			if (values.profile !== undefined) {
				profile = profileRef(values.profile)
				if (profile === null) return usage(`--profile takes builtin:<id> or custom:<id>, not "${values.profile}".`)
			}
			const playlistMode = values.playlist === true ? 'playlist' : values.video === true ? 'video' : undefined
			return call('links.add', {requestId: values['request-id'] ?? newRequestId(), url: rest[0], profile, playlistMode})
		}
		case 'get': {
			const problem = expect(1, values.intake === true ? 'one intakeId' : 'one itemId')
			if (problem !== null) return usage(problem)
			return values.intake === true ? call('intake.get', {intakeId: rest[0]}) : call('queue.get', {itemId: rest[0]})
		}
		case 'wait': {
			const problem = expect(1, values.intake === true ? 'one intakeId' : 'one itemId')
			if (problem !== null) return usage(problem)
			const timeoutMs = integer(values.timeout, 'timeout')
			if (typeof timeoutMs === 'string') return usage(timeoutMs)
			const target = values.intake === true ? {intakeId: rest[0]} : {itemId: rest[0]}
			return call('wait', {...target, until: values.until ?? 'settled', timeoutMs: timeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS})
		}
		default: {
			if (!isItemCommand(command)) return usage(`Unknown command "${command}".`)
			const problem = expect(1, 'one itemId')
			if (problem !== null) return usage(problem)
			return call(ITEM_COMMANDS[command], {itemId: rest[0]})
		}
	}
}

export interface CliDependencies {
	readonly client: ArroxyClient
	readonly stdout: (text: string) => void
	readonly stderr: (text: string) => void
	readonly serve: () => Promise<void>
	readonly newRequestId: () => string
}

const EXIT_OK = 0
const EXIT_ERROR = 1
const EXIT_NOT_RUNNING = 2

export async function runCli(argv: readonly string[], dependencies: CliDependencies): Promise<number> {
	const command = parseCommand(argv, dependencies.newRequestId)
	switch (command.kind) {
		case 'help':
			dependencies.stdout(USAGE)
			return EXIT_OK
		case 'version':
			dependencies.stdout(`${ARROXY_MCP_VERSION}\n`)
			return EXIT_OK
		case 'usage':
			dependencies.stderr(`${command.message}\n\n${USAGE}`)
			return EXIT_ERROR
		case 'serve':
			await dependencies.serve()
			return EXIT_OK
		case 'call': {
			const outcome = await dependencies.client.callUnchecked(command.method, command.params)
			if (outcome.ok) {
				dependencies.stdout(`${JSON.stringify(outcome.value, null, 2)}\n`)
				return EXIT_OK
			}
			dependencies.stderr(`${formatFailure(outcome.failure)}\n`)
			return outcome.failure.kind === 'notRunning' ? EXIT_NOT_RUNNING : EXIT_ERROR
		}
	}
}
