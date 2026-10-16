// @vitest-environment node
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
import {dirname, join} from 'node:path'
import {describe, expect, it, vi} from 'vite-plus/test'
import {exploreAdBlockPreloadPlugin} from '../../electron.vite.config.js'
import {INJECT_COSMETICS_CHANNEL, MUTATION_OBSERVER_CHANNEL} from '@main/services/explore/ExploreAdBlocker.js'

vi.mock('electron', () => ({ipcMain: {handle: vi.fn(), removeHandler: vi.fn()}}))

// Tripwires for a library upgrade. Arroxy mirrors @ghostery/adblocker-electron's
// BlockingContext instead of calling it (spec: Ad blocker), so an upstream
// change to what it registers, or to the channels its preload invokes, would
// otherwise fail silently: cosmetics would stop, or a new hook would be missed.

const require = createRequire(import.meta.url)

// What ExploreAdBlocker registers in hook(): the same as BlockingContext.enable().
const MIRRORED = {ipcChannels: [INJECT_COSMETICS_CHANNEL, MUTATION_OBSERVER_CHANNEL].sort(), webRequestEvents: ['onBeforeRequest', 'onHeadersReceived'], preloadTypes: ['frame']}

function blockingContextEnable(): string {
	const pkg = require.resolve('@ghostery/adblocker-electron/package.json')
	const source = readFileSync(join(dirname(pkg), 'dist', 'esm', 'index.js'), 'utf8')
	const start = source.indexOf('class BlockingContext')
	const enable = source.indexOf('enable() {', start)
	const disable = source.indexOf('disable() {', enable)
	if (start < 0 || enable < 0 || disable < 0) throw new Error('BlockingContext.enable() not found: the library changed shape, re-check ExploreAdBlocker')
	return source.slice(enable, disable)
}

// The engine's cosmetic handler, from the library's source.
function onInjectCosmeticFilters(): string {
	const pkg = require.resolve('@ghostery/adblocker-electron/package.json')
	const source = readFileSync(join(dirname(pkg), 'dist', 'esm', 'index.js'), 'utf8')
	const start = source.indexOf('this.onInjectCosmeticFilters = async (event')
	const end = source.indexOf('this.onHeadersReceived', start)
	if (start < 0 || end < 0) throw new Error('ElectronBlocker.onInjectCosmeticFilters not found: the library changed shape, re-check CosmeticEvent')
	return source.slice(start, end)
}

const PINNED_EVENT_READ = /^event\.(frameId|processId|sender\.executeJavaScript|sender\.insertCSS)\b/

// The handler's uses of its `event` parameter after the parameter list:
// the pinned member reads, and anything else (cut to 24 characters).
function eventUses(handler: string): {pinned: string[]; other: string[]} {
	const params = /=\s*async\s*\(\s*event\s*,[^)]*\)\s*=>/.exec(handler)
	if (!params || params.index === undefined) throw new Error('the cosmetic handler no longer takes (event, …): re-check CosmeticEvent')
	const body = handler.slice(params.index + params[0].length)
	const pinned = new Set<string>()
	const other: string[] = []
	for (const match of body.matchAll(/\bevent\b/g)) {
		const rest = body.slice(match.index)
		const read = PINNED_EVENT_READ.exec(rest)
		if (read?.[1]) pinned.add(read[1])
		else other.push(rest.slice(0, 24))
	}
	return {pinned: [...pinned].sort(), other}
}

function emittedPreload(): string {
	let source = ''
	const generateBundle = exploreAdBlockPreloadPlugin().generateBundle as unknown as (this: {emitFile: (file: {source: string}) => void}) => void
	generateBundle.call({
		emitFile: file => {
			source = file.source
		}
	})
	return source
}

describe('the ad blocker against its library', () => {
	it('mirrors everything BlockingContext.enable() registers', () => {
		const enable = blockingContextEnable()
		const ipcChannels = [...enable.matchAll(/ipcMain\.handle\(\s*'([^']+)'/g)].map(match => match[1]).sort()
		const webRequestEvents = [...enable.matchAll(/webRequest\.(on\w+)\(/g)].map(match => match[1]).sort()
		const preloadTypes = [...enable.matchAll(/registerPreloadScript\(\{\s*type:\s*'([^']+)'/g)].map(match => match[1])

		expect({ipcChannels, webRequestEvents, preloadTypes}).toEqual(MIRRORED)
		// Nothing else on the session or ipcMain.
		expect([...enable.matchAll(/(?:this\.session|ipcMain)\.(\w+)/g)].map(match => match[1]).filter(call => !['handle', 'registerPreloadScript', 'webRequest'].includes(call))).toEqual([])
	})

	// ExploreAdBlocker hands the engine a CosmeticEvent (a contained sender), not the IPC event.
	// Every use of `event` past the parameter list must be one of the pinned
	// member reads: a destructure (`const {sender} = event`), a pass-through
	// (`fn(event)`) or another member would reach past CosmeticEvent.
	it('the cosmetic handler reads only what CosmeticEvent carries', () => {
		expect(eventUses(onInjectCosmeticFilters())).toEqual({pinned: ['frameId', 'processId', 'sender.executeJavaScript', 'sender.insertCSS'], other: []})
	})

	it('the tripwire catches any other use of the event', () => {
		const handler = (body: string): string => `this.onInjectCosmeticFilters = async (event, url, msg) => { ${body} }`
		expect(eventUses(handler('const {sender} = event; sender.insertCSS(x)')).other).toHaveLength(1)
		expect(eventUses(handler('track(event)')).other).toHaveLength(1)
		expect(eventUses(handler('event.senderFrame.url')).other).toHaveLength(1)
		expect(eventUses(handler('event["sender"]')).other).toHaveLength(1)
	})

	it('the shipped preload invokes exactly the channels Arroxy answers', () => {
		const invoked = [...new Set([...emittedPreload().matchAll(/ipcRenderer\s*\.invoke\(\s*'([^']+)'/g)].map(match => match[1]))].sort()
		expect(invoked).toEqual(MIRRORED.ipcChannels)
	})
})
