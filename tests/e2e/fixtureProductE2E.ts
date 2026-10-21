import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type {ElectronApplication, Page} from '@playwright/test'
import {DEFAULT_DOWNLOAD_PROFILES_PREFS, resolveActiveDownloadProfile, resolveDownloadProfile} from '../../src/shared/downloadProfiles.js'
import {DEFAULT_FILENAME_TEMPLATE} from '../../src/shared/filenameTemplate.js'
import {prepareJob} from '../../src/shared/prepareJob.js'
import {queueArraySchema} from '../../src/shared/queueItemSchema.js'
import type {ExploreCookie} from '../../src/shared/sites/types.js'
import type {AppSettings, JobAuth, QueueItem} from '../../src/shared/types.js'
import {
	assertNoExternalRequests,
	buildFixtureElectronEnv,
	buildFixtureEnv,
	electronExecutable,
	fixtureOverlapPlaylistUrl,
	fixturePlaylistUrl,
	fixtureRepeatedPlaylistUrl,
	fixtureUrl,
	runProcess,
	startDenyProxy,
	startFixtureServer,
	writeE2eSettings,
	writeExploreCookies,
	type FixtureServer,
	type FixtureServerBehavior,
	type ProcessResult
} from './fixtureHarness.js'
import {applyQueueAction, expectMp4Count, expectNoMp4For, expectQueueStatus, launchFixtureApp, listFilesRecursive, mediaFiles, openQueueTab, prepareFixtureRuntime, queueCardByTitle, type QueueRowAction} from './fixtureWorkflow.js'
import {makeFixtureOutputDir} from './outputRoot.js'

interface FixtureProductOptions {
	behavior?: FixtureServerBehavior
	settings?: (settings: AppSettings) => void
	// Seeded into the Explore partition at startup, as if the user had signed in.
	exploreCookies?: readonly ExploreCookie[]
	// A local page the Explore view opens instead of YouTube.
	exploreHomeUrl?: string
	// A filter list the Explore ad blocker is built from, written to the profile: no list is ever fetched.
	exploreAdBlockFilters?: string
	// How long Explore waits after the tab is left before releasing the page.
	exploreIdleUnloadMs?: number
	// A queue left by a previous session, restored at startup.
	restoredQueue?: (outputDir: string) => QueueItem[]
	// Arguments after the app's entry on the first launch, e.g. an arroxy:// link.
	launchArgs?: readonly string[]
	userDataPrefix?: string
	outputPrefix?: string
}

interface FixtureYtDlpOptions {
	behavior?: FixtureServerBehavior
	userDataPrefix?: string
	outputPrefix?: string
}

interface UrlHelpers {
	video: (videoId: string) => string
	playlist: () => string
	repeatedPlaylist: () => string
	overlapPlaylist: () => string
	videos: (videoIds: readonly string[]) => string[]
}

interface QueueHelpers {
	open: () => Promise<void>
	cardByTitle: (title: string) => ReturnType<typeof queueCardByTitle>
	expectStatus: (title: string, status: string, timeout?: number) => Promise<void>
	action: (title: string, action: QueueRowAction) => Promise<void>
}

interface FileHelpers {
	listRecursive: (dir?: string) => string[]
	mediaFiles: (extension: string, dir?: string) => string[]
	expectMp4Count: (count: number, dir?: string) => void
	expectNoMp4For: (videoId: string, dir?: string) => void
}

export interface FixtureProductContext {
	app: ElectronApplication
	page: Page
	fixtureServer: FixtureServer
	userDataDir: string
	outputDir: string
	urls: UrlHelpers
	queue: QueueHelpers
	files: FileHelpers
	relaunch: () => Promise<{app: ElectronApplication; page: Page; queue: QueueHelpers}>
	// Starts Arroxy again on the same profile, as a second launch from the OS
	// does: it hands its arguments to the running app and exits.
	launchSecondInstance: (args: readonly string[]) => Promise<ProcessResult>
}

export interface FixtureYtDlpContext {
	fixtureServer: FixtureServer
	userDataDir: string
	outputDir: string
	ytDlpPath: string
	env: Record<string, string>
	// For launching the app itself as a headless process (no Playwright window).
	electronEnv: Record<string, string>
	urls: UrlHelpers
	runYtDlp: (args: string[], timeoutMs?: number) => Promise<ProcessResult>
}

function urls(): UrlHelpers {
	return {video: fixtureUrl, playlist: fixturePlaylistUrl, repeatedPlaylist: fixtureRepeatedPlaylistUrl, overlapPlaylist: fixtureOverlapPlaylistUrl, videos: videoIds => videoIds.map(fixtureUrl)}
}

function queue(page: Page): QueueHelpers {
	return {open: () => openQueueTab(page), cardByTitle: title => queueCardByTitle(page, title), expectStatus: (title, status, timeout) => expectQueueStatus(page, title, status, timeout), action: (title, action) => applyQueueAction(page, title, action)}
}

function files(outputDir: string): FileHelpers {
	return {listRecursive: (dir = outputDir) => listFilesRecursive(dir), mediaFiles: (extension, dir = outputDir) => mediaFiles(dir, extension), expectMp4Count: (count, dir = outputDir) => expectMp4Count(dir, count), expectNoMp4For: (videoId, dir = outputDir) => expectNoMp4For(dir, videoId)}
}

async function attemptCleanup(cleanup: () => Promise<void> | void): Promise<void> {
	try {
		await cleanup()
	} catch {
		// Best-effort test teardown; keep draining the remaining resources.
	}
}

// Validated with the app's own schema: a malformed seed would otherwise be
// dropped at load as a corrupted queue and the scenario would wait for nothing.
function writeRestoredQueue(userDataDir: string, items: QueueItem[]): void {
	fs.writeFileSync(path.join(userDataDir, 'queue.json'), JSON.stringify({items: queueArraySchema.parse(items)}), 'utf8')
}

/**
 * A queue item as Quick Download builds it with the default profile, left
 * pending by a previous session. Restored at startup, it downloads with a fresh
 * extraction and no probe in between.
 */
export function restoredQueueItem(id: string, videoId: string, title: string, outputDir: string, auth?: JobAuth): QueueItem {
	const {profile, ref} = resolveActiveDownloadProfile(DEFAULT_DOWNLOAD_PROFILES_PREFS)
	const resolved = resolveDownloadProfile(profile, ref)
	if (!resolved.intent) throw new Error('the default download profile has no media intent')
	const job = prepareJob({
		mode: 'playlist',
		extractor: 'youtube',
		extractorKey: 'Youtube',
		mediaIntent: resolved.intent,
		filenameTemplate: DEFAULT_FILENAME_TEMPLATE,
		subtitles: resolved.subtitles,
		sponsorBlockMode: resolved.sponsorBlock.mode,
		sponsorBlockCategories: resolved.sponsorBlock.mode === 'off' ? [] : resolved.sponsorBlock.categories,
		embed: resolved.embed
	})
	return {
		id,
		url: fixtureUrl(videoId),
		title,
		thumbnail: '',
		outputDir,
		formatLabel: profile.name,
		status: 'pending',
		lane: 'normal',
		progressPercent: 0,
		progressDetail: null,
		lastStatus: null,
		error: null,
		addedAt: new Date().toISOString(),
		finishedAt: null,
		writeM3u: false,
		retryCount: 0,
		artifacts: [],
		...(auth ? {auth} : {}),
		job
	}
}

/** The queue as the app last persisted it, parsed with the app's own schema. */
export function readPersistedQueue(userDataDir: string): QueueItem[] {
	const raw: unknown = JSON.parse(fs.readFileSync(path.join(userDataDir, 'queue.json'), 'utf8'))
	const items = typeof raw === 'object' && raw !== null && 'items' in raw ? raw.items : undefined
	return queueArraySchema.parse(items)
}

export async function withFixtureProductApp(options: FixtureProductOptions, run: (ctx: FixtureProductContext) => Promise<void>): Promise<void> {
	const ytDlpPath = await prepareFixtureRuntime()
	const fixtureServer = await startFixtureServer(options.behavior)
	const denyProxy = await startDenyProxy()
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), options.userDataPrefix ?? 'arroxy-fixture-user-'))
	const outputDir = makeFixtureOutputDir(options.outputPrefix ?? 'arroxy-fixture-out-')
	writeE2eSettings(userDataDir, outputDir, options.settings)
	const exploreCookiesPath = options.exploreCookies ? writeExploreCookies(userDataDir, options.exploreCookies) : undefined
	if (options.restoredQueue) writeRestoredQueue(userDataDir, options.restoredQueue(outputDir))
	let exploreAdBlockFiltersPath: string | undefined
	if (options.exploreAdBlockFilters !== undefined) {
		exploreAdBlockFiltersPath = path.join(userDataDir, 'e2e-adblock-filters.txt')
		fs.writeFileSync(exploreAdBlockFiltersPath, options.exploreAdBlockFilters, 'utf8')
	}
	const launchInput = {userDataDir, fixtureServer, denyProxy, exploreCookiesPath, exploreHomeUrl: options.exploreHomeUrl, exploreAdBlockFiltersPath, exploreIdleUnloadMs: options.exploreIdleUnloadMs}

	let app: ElectronApplication | null = null
	try {
		const launched = await launchFixtureApp(ytDlpPath, launchInput, options.launchArgs)
		app = launched.app
		await run({
			app,
			page: launched.page,
			fixtureServer,
			userDataDir,
			outputDir,
			urls: urls(),
			queue: queue(launched.page),
			files: files(outputDir),
			relaunch: async () => {
				if (app) await app.close()
				const next = await launchFixtureApp(ytDlpPath, launchInput)
				app = next.app
				return {app: next.app, page: next.page, queue: queue(next.page)}
			},
			launchSecondInstance: args => {
				// Chromium's SUID sandbox check aborts a bare launch on a Linux CI runner.
				const sandboxArgs = process.platform === 'linux' ? ['--no-sandbox'] : []
				return runProcess(electronExecutable(), [...sandboxArgs, path.join(process.cwd(), 'out', 'main', 'index.js'), ...args], {env: buildFixtureElectronEnv({...launchInput, ytDlpPath}), timeoutMs: 30_000})
			}
		})
		assertNoExternalRequests(denyProxy)
	} finally {
		const appToClose = app
		await Promise.all([appToClose ? attemptCleanup(() => appToClose.close()) : Promise.resolve(), attemptCleanup(() => denyProxy.close()), attemptCleanup(() => fixtureServer.close())])
		await attemptCleanup(() => fs.rmSync(userDataDir, {recursive: true, force: true}))
		await attemptCleanup(() => fs.rmSync(outputDir, {recursive: true, force: true}))
	}
}

export async function withFixtureYtDlp(options: FixtureYtDlpOptions, run: (ctx: FixtureYtDlpContext) => Promise<void>): Promise<void> {
	const ytDlpPath = await prepareFixtureRuntime()
	const fixtureServer = await startFixtureServer(options.behavior)
	const denyProxy = await startDenyProxy()
	const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), options.userDataPrefix ?? 'arroxy-fixture-ytdlp-user-'))
	const outputDir = makeFixtureOutputDir(options.outputPrefix ?? 'arroxy-fixture-ytdlp-out-')
	const env = buildFixtureEnv({userDataDir, fixtureServer, denyProxy, ytDlpPath})
	const electronEnv = buildFixtureElectronEnv({userDataDir, fixtureServer, denyProxy, ytDlpPath})

	try {
		await run({fixtureServer, userDataDir, outputDir, ytDlpPath, env, electronEnv, urls: urls(), runYtDlp: (args, timeoutMs) => runProcess(ytDlpPath, args, {env, timeoutMs})})
		assertNoExternalRequests(denyProxy)
	} finally {
		await Promise.all([attemptCleanup(() => denyProxy.close()), attemptCleanup(() => fixtureServer.close())])
		await attemptCleanup(() => fs.rmSync(userDataDir, {recursive: true, force: true}))
		await attemptCleanup(() => fs.rmSync(outputDir, {recursive: true, force: true}))
	}
}
