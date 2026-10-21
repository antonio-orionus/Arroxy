import {randomUUID} from 'node:crypto'
import {type CallToolResult, McpServer} from '@modelcontextprotocol/server'
import {CONTROL_METHODS, type ControlMethod, WAIT_TIMEOUT_MAX_MS} from 'arroxy-control'
import {z} from 'zod'
import {type ArroxyClient, type CallOutcome, checkParams, formatFailure} from './client'
import {ARROXY_MCP_VERSION} from './version'

// The MCP face of the Control API: a few coarse tools. Their names are
// permanent; agents and their users store them in allow-lists.
export const TOOL_NAMES = ['arroxy_status', 'arroxy_add_link', 'arroxy_get', 'arroxy_list_queue', 'arroxy_wait', 'arroxy_item_action', 'arroxy_queue_action', 'arroxy_answer_intake'] as const

// Below the 60 s a Codex tool call may take by default, so a plain wait
// answers before the agent gives up on it.
export const DEFAULT_WAIT_TIMEOUT_MS = 50_000

const ITEM_METHODS = {pause: 'queue.pause', resume: 'queue.resume', cancel: 'queue.cancel', retry: 'queue.retry', remove: 'queue.remove'} as const satisfies Record<string, ControlMethod>
const QUEUE_METHODS = {pauseAll: 'queue.pauseAll', resumeAll: 'queue.resumeAll'} as const satisfies Record<string, ControlMethod>
const INTAKE_METHODS = {choose: 'intake.choose', retry: 'intake.retry', cancel: 'intake.cancel'} as const satisfies Record<string, ControlMethod>
type ItemAction = keyof typeof ITEM_METHODS
type QueueAction = keyof typeof QUEUE_METHODS
type IntakeAction = keyof typeof INTAKE_METHODS

// Input fields come from the bundled arroxy-control schemas, so the tool list
// follows the Control API version this package ships with.
const linksAdd = CONTROL_METHODS['links.add'].params.shape
const itemIdSchema = CONTROL_METHODS['queue.get'].params.shape.itemId
const intakeIdSchema = CONTROL_METHODS['intake.get'].params.shape.intakeId
const [waitForIntake] = CONTROL_METHODS.wait.params.options
const [chooseAll, chooseFirst] = CONTROL_METHODS['intake.choose'].params.options

const statusInput = z.object({})
const addLinkInput = z.object({
	url: linksAdd.url.describe('An http(s) link to a video, playlist or channel.'),
	profile: linksAdd.profile.describe('A profile from arroxy_status to use for this link only. Left out, the active profile is used.'),
	playlistMode: linksAdd.playlistMode.describe('For a video inside a playlist: queue just the video, or the whole playlist. Left out, the video.'),
	requestId: linksAdd.requestId.optional().describe('Resend the same requestId to retry without queueing twice. Left out, a new one is made.')
})
const getInput = z.object({itemId: itemIdSchema.optional().describe('A queue item id.'), intakeId: intakeIdSchema.optional().describe('An intake id from arroxy_add_link.')})
const listQueueInput = CONTROL_METHODS['queue.list'].params
const waitInput = z.object({
	itemId: itemIdSchema.optional().describe('Wait for this queue item.'),
	intakeId: intakeIdSchema.optional().describe('Wait for this intake.'),
	until: waitForIntake.shape.until.optional().describe('settled: stops moving on its own (default). done: finished downloading.'),
	timeoutMs: waitForIntake.shape.timeoutMs.optional().describe(`Longest wait in ms, at most ${WAIT_TIMEOUT_MAX_MS} (default ${DEFAULT_WAIT_TIMEOUT_MS}).`)
})
const itemActionInput = z.object({action: z.enum(['pause', 'resume', 'cancel', 'retry', 'remove'] satisfies ItemAction[]), itemId: itemIdSchema})
const queueActionInput = z.object({action: z.enum(['pauseAll', 'resumeAll'] satisfies QueueAction[])})
const answerIntakeInput = z.object({
	action: z.enum(['choose', 'retry', 'cancel'] satisfies IntakeAction[]),
	intakeId: intakeIdSchema,
	take: z.union([chooseAll.shape.take, chooseFirst.shape.take]).optional().describe('For choose: queue all offered entries, or the first `count`.'),
	count: chooseFirst.shape.count.optional().describe('For choose with take first: how many entries.')
})

function errorResult(text: string): CallToolResult {
	return {isError: true, content: [{type: 'text', text}]}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toolResult(outcome: CallOutcome<unknown>): CallToolResult {
	if (!outcome.ok) return errorResult(formatFailure(outcome.failure))
	const result: CallToolResult = {content: [{type: 'text', text: JSON.stringify(outcome.value, null, 2)}]}
	if (isRecord(outcome.value)) result.structuredContent = outcome.value
	return result
}

// Params are checked against the method's schema before anything connects.
async function callTool(client: ArroxyClient, method: ControlMethod, params: unknown): Promise<CallToolResult> {
	const checked = checkParams(method, params)
	if (!checked.ok) return errorResult(checked.message)
	return toolResult(await client.callUnchecked(method, checked.params))
}

type Target = {readonly itemId: string} | {readonly intakeId: string}

function oneTarget(itemId: string | undefined, intakeId: string | undefined): Target | null {
	if (itemId !== undefined && intakeId === undefined) return {itemId}
	if (intakeId !== undefined && itemId === undefined) return {intakeId}
	return null
}

const ONE_TARGET = 'Pass exactly one of itemId or intakeId.'

export interface ArroxyMcpServerOptions {
	readonly newRequestId?: () => string
}

// Every tool is registered here, before connect: registering one later makes
// the SDK send list_changed, and some clients (Codex) never re-read the list.
export function createArroxyMcpServer(client: ArroxyClient, options: ArroxyMcpServerOptions = {}): McpServer {
	const newRequestId = options.newRequestId ?? randomUUID
	const server = new McpServer({name: 'arroxy-mcp', version: ARROXY_MCP_VERSION}, {capabilities: {tools: {listChanged: false}}})

	server.registerTool('arroxy_status', {description: 'Show whether Arroxy is ready, its queue state and site cooldowns, and the download profiles.', inputSchema: statusInput}, async () =>
		toolResult(await client.session(async session => ({status: await session.request('status', {}), profiles: await session.request('profiles.list', {})})))
	)

	server.registerTool('arroxy_add_link', {description: 'Add a link to the Arroxy queue. Returns at once with an intake to follow with arroxy_get or arroxy_wait.', inputSchema: addLinkInput}, args => callTool(client, 'links.add', {...args, requestId: args.requestId ?? newRequestId()}))

	server.registerTool('arroxy_get', {description: 'Read one queue item (itemId) or one intake (intakeId).', inputSchema: getInput}, ({itemId, intakeId}) => {
		const target = oneTarget(itemId, intakeId)
		if (target === null) return errorResult(ONE_TARGET)
		return 'itemId' in target ? callTool(client, 'queue.get', target) : callTool(client, 'intake.get', target)
	})

	server.registerTool('arroxy_list_queue', {description: 'List the queue, one page at a time. Pass nextCursor back as cursor until it is null.', inputSchema: listQueueInput}, args => callTool(client, 'queue.list', args))

	server.registerTool('arroxy_wait', {description: 'Wait until a queue item or an intake settles or is done, or the timeout passes.', inputSchema: waitInput}, ({itemId, intakeId, until, timeoutMs}) => {
		const target = oneTarget(itemId, intakeId)
		if (target === null) return errorResult(ONE_TARGET)
		return callTool(client, 'wait', {...target, until: until ?? 'settled', timeoutMs: timeoutMs ?? DEFAULT_WAIT_TIMEOUT_MS})
	})

	server.registerTool('arroxy_item_action', {description: 'Pause, resume, cancel, retry or remove one queue item.', inputSchema: itemActionInput}, ({action, itemId}) => callTool(client, ITEM_METHODS[action], {itemId}))

	server.registerTool('arroxy_queue_action', {description: 'Pause or resume the whole queue.', inputSchema: queueActionInput}, ({action}) => callTool(client, QUEUE_METHODS[action], {}))

	server.registerTool('arroxy_answer_intake', {description: 'Answer an intake: choose entries for one that needs your choice, retry a failed probe, or cancel it.', inputSchema: answerIntakeInput}, ({action, intakeId, take, count}) =>
		callTool(client, INTAKE_METHODS[action], action === 'choose' ? {intakeId, take, count} : {intakeId})
	)

	return server
}
