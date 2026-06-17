import {execFile, spawn, type SpawnOptions} from 'node:child_process'
import {constants as fsConstants} from 'node:fs'
import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import net from 'node:net'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {promisify} from 'node:util'
import {checkEmbeddedPayload, hostEmbeddedTarget} from './build/embeddedPayload.js'

const RENDERER_HOST = '127.0.0.1' as const
const RENDERER_PORT_BASE = 20_000
const RENDERER_PORT_RANGE = 20_000
const RENDERER_PORT_PROBE_LIMIT = 100

const execFileAsync = promisify(execFile)

export interface DevEnvPaths {
	repoRoot: string
	rendererHost: '127.0.0.1'
	rendererPort: number
	rendererPortSource: 'override' | 'computed'
	electronUserData: string
	electronUserDataSource: 'override' | 'computed'
	tmpDir: string
	tmpDirSource: 'override' | 'computed'
}

type ToolName = 'node' | 'bun'

export interface ToolVersionStatus {
	name: ToolName
	expected: string
	actual: string | null
	ok: boolean
	message?: string
}

interface ToolVersionMismatchInput {
	name: ToolName
	expected: string
	actual: string | null
	hasMiseConfig: boolean
	miseAvailable: boolean
}

export interface DoctorCheck {
	id: string
	label: string
	ok: boolean
	severity: 'required' | 'optional'
	message?: string
}

export interface DoctorReport {
	ok: boolean
	repoRoot: string
	env: DevEnvPaths
	tools: {node: ToolVersionStatus; bun: ToolVersionStatus}
	checks: DoctorCheck[]
}

function stableHash(value: string): number {
	let hash = 0x811c9dc5
	for (let index = 0; index < value.length; index += 1) {
		hash ^= value.charCodeAt(index)
		hash = Math.imul(hash, 0x01000193)
	}
	return hash >>> 0
}

function parsePort(value: string, name: string): number {
	if (!/^\d+$/.test(value)) {
		throw new Error(`Invalid ${name}: ${value}`)
	}

	const port = Number(value)
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`Invalid ${name}: ${value}`)
	}

	return port
}

export function computeDefaultRendererPort(repoRoot: string): number {
	return RENDERER_PORT_BASE + (stableHash(repoRoot) % RENDERER_PORT_RANGE)
}

export function resolveDevEnv(input: {repoRoot: string; env?: Record<string, string | undefined>}): DevEnvPaths {
	const env = input.env ?? process.env
	const rendererPortOverride = nonBlankOverride(env.ARROXY_RENDERER_PORT)
	const electronUserDataOverride = nonBlankOverride(env.ELECTRON_USER_DATA)
	const tmpDirOverride = nonBlankOverride(env.ARROXY_DEV_TMP)

	return {
		repoRoot: input.repoRoot,
		rendererHost: RENDERER_HOST,
		rendererPort: rendererPortOverride ? parsePort(rendererPortOverride, 'ARROXY_RENDERER_PORT') : computeDefaultRendererPort(input.repoRoot),
		rendererPortSource: rendererPortOverride ? 'override' : 'computed',
		electronUserData: electronUserDataOverride ?? path.join(input.repoRoot, '.electron-user-data', 'dev'),
		electronUserDataSource: electronUserDataOverride ? 'override' : 'computed',
		tmpDir: tmpDirOverride ?? path.join(input.repoRoot, '.tmp', 'dev'),
		tmpDirSource: tmpDirOverride ? 'override' : 'computed'
	}
}

export function createDoctorReport(input: {repoRoot: string; env: DevEnvPaths; tools: {node: ToolVersionStatus; bun: ToolVersionStatus}; checks: DoctorCheck[]}): DoctorReport {
	return {ok: input.tools.node.ok && input.tools.bun.ok && input.checks.every(check => check.severity !== 'required' || check.ok), repoRoot: input.repoRoot, env: input.env, tools: input.tools, checks: input.checks}
}

interface PackageJson {
	packageManager?: string
}

interface ElectronPayloadStatus {
	ok: boolean
	message?: string
	packageDir?: string
	binaryPath?: string
}

interface EmbeddedPayloadStatus {
	ok: boolean
	message?: string
	dir: string
}

interface LauncherEnvOptions {
	sandbox?: boolean
	gpu?: 'force' | 'swiftshader'
}

type LauncherName = 'electron' | 'mock' | 'browser-test' | 'browser-smoke'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null
}

function asPackageJson(value: unknown): PackageJson {
	if (!isRecord(value)) return {}
	return {packageManager: typeof value.packageManager === 'string' ? value.packageManager : undefined}
}

function commandName(name: 'bun' | 'node' | 'mise'): string {
	if (process.platform === 'win32') return `${name}.exe`
	return name
}

function nonBlankOverride(value: string | undefined): string | undefined {
	const trimmed = value?.trim()
	if (!trimmed) return undefined
	return trimmed
}

async function readText(filePath: string): Promise<string> {
	return fs.readFile(filePath, 'utf8')
}

async function pathExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath, fsConstants.F_OK)
		return true
	} catch {
		return false
	}
}

async function directoryExists(dirPath: string): Promise<boolean> {
	try {
		const stat = await fs.stat(dirPath)
		return stat.isDirectory()
	} catch {
		return false
	}
}

async function captureCommand(command: string, args: string[], options: {cwd?: string; env?: NodeJS.ProcessEnv} = {}): Promise<string> {
	const {stdout} = await execFileAsync(command, args, {cwd: options.cwd, env: options.env, maxBuffer: 1024 * 1024})
	return stdout.trim()
}

async function findRepoRoot(cwd: string): Promise<string> {
	try {
		return await captureCommand('git', ['rev-parse', '--show-toplevel'], {cwd})
	} catch {
		return cwd
	}
}

async function isPortAvailable(host: string, port: number): Promise<boolean> {
	return new Promise(resolve => {
		const server = net.createServer()
		server.once('error', () => resolve(false))
		server.once('listening', () => {
			server.close(() => resolve(true))
		})
		server.listen(port, host)
	})
}

async function findAvailablePort(host: string, startPort: number): Promise<number> {
	for (let offset = 0; offset < RENDERER_PORT_PROBE_LIMIT; offset += 1) {
		const port = startPort + offset
		if (port > 65_535) break
		if (await isPortAvailable(host, port)) return port
	}

	throw new Error(`No available renderer port found from ${startPort} through ${startPort + RENDERER_PORT_PROBE_LIMIT - 1}`)
}

export async function resolveRuntimeDevEnv(repoRoot: string, rawEnv: Record<string, string | undefined> = process.env): Promise<DevEnvPaths> {
	const env = resolveDevEnv({repoRoot, env: rawEnv})
	if (env.rendererPortSource === 'override') return env

	const rendererPort = await findAvailablePort(env.rendererHost, env.rendererPort)
	return {...env, rendererPort}
}

export async function resolveDoctorDevEnv(repoRoot: string, rawEnv: Record<string, string | undefined> = process.env): Promise<DevEnvPaths> {
	const env = resolveDevEnv({repoRoot, env: rawEnv})
	if (env.rendererPortSource === 'override') return env

	for (let offset = 0; offset < RENDERER_PORT_PROBE_LIMIT; offset += 1) {
		const rendererPort = env.rendererPort + offset
		if (rendererPort > 65_535) break
		const candidate = {...env, rendererPort}
		if (await isPortAvailable(env.rendererHost, rendererPort)) return candidate
		if (await httpResponds(`http://${env.rendererHost}:${rendererPort}/`)) return candidate
	}

	return {...env, rendererPort: await findAvailablePort(env.rendererHost, env.rendererPort)}
}

async function ensureDevDirs(env: DevEnvPaths): Promise<void> {
	await Promise.all([fs.mkdir(env.electronUserData, {recursive: true}), fs.mkdir(env.tmpDir, {recursive: true})])
}

function buildChildEnv(env: DevEnvPaths): NodeJS.ProcessEnv {
	return {...process.env, ARROXY_RENDERER_PORT: String(env.rendererPort), ELECTRON_USER_DATA: env.electronUserData, ARROXY_DEV_TMP: env.tmpDir, TMPDIR: env.tmpDir, TMP: env.tmpDir, TEMP: env.tmpDir}
}

export async function spawnChecked(command: string, args: string[], options: SpawnOptions & {cwd: string; env: NodeJS.ProcessEnv}): Promise<void> {
	await new Promise<void>((resolve, reject) => {
		const child = spawn(command, args, {...options, shell: false, stdio: 'inherit'})
		const forwardedSignals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM']
		const handlers: Partial<Record<NodeJS.Signals, () => void>> = {SIGINT: () => child.kill('SIGINT'), SIGTERM: () => child.kill('SIGTERM')}
		const cleanup = (): void => {
			for (const signal of forwardedSignals) {
				const handler = handlers[signal]
				if (handler) process.off(signal, handler)
			}
		}
		for (const signal of forwardedSignals) {
			const handler = handlers[signal]
			if (handler) process.on(signal, handler)
		}
		child.once('error', error => {
			cleanup()
			reject(error)
		})
		child.once('exit', (code, signal) => {
			cleanup()
			if (code === 0) {
				resolve()
				return
			}

			const suffix = signal ? `signal ${signal}` : `exit code ${code ?? 'unknown'}`
			reject(new Error(`${command} ${args.join(' ')} failed with ${suffix}`))
		})
	})
}

async function runStep(label: string, action: () => Promise<void>): Promise<void> {
	console.log(`\n${label}`)
	await action()
}

async function readExpectedNodeVersion(repoRoot: string): Promise<string> {
	return (await readText(path.join(repoRoot, '.node-version'))).trim()
}

async function readExpectedBunVersion(repoRoot: string): Promise<string> {
	const packageJson = asPackageJson(JSON.parse(await readText(path.join(repoRoot, 'package.json'))))
	const match = packageJson.packageManager?.match(/^bun@(.+)$/)
	if (!match) throw new Error('package.json packageManager must use bun@<version>')
	return match[1]
}

function normalizeNodeVersion(value: string): string {
	return value.trim().replace(/^v/, '')
}

async function actualVersion(name: ToolName, repoRoot: string): Promise<string | null> {
	try {
		const raw = await captureCommand(commandName(name), ['--version'], {cwd: repoRoot, env: process.env})
		return name === 'node' ? normalizeNodeVersion(raw) : raw.trim()
	} catch {
		return null
	}
}

export function createToolVersionMismatchMessage(input: ToolVersionMismatchInput): string {
	const base = input.actual ? `expected ${input.expected}, got ${input.actual}` : `expected ${input.expected}, but ${input.name} was not found`
	if (input.hasMiseConfig && input.miseAvailable) return `${base}. Recommended: run \`mise install\` from the repo root, ensure your shell activates mise, then rerun \`bun run doctor\`.`
	if (input.hasMiseConfig) return `${base}. Recommended: install mise and run \`mise install\`, or manually activate ${input.name} ${input.expected}, then rerun \`bun run doctor\`.`
	return `${base}. Activate ${input.name} ${input.expected}, then rerun \`bun run doctor\`.`
}

function versionStatus(name: ToolName, expected: string, actual: string | null, guidance: {hasMiseConfig: boolean; miseAvailable: boolean}): ToolVersionStatus {
	const ok = actual === expected
	return {name, expected, actual, ok, ...(ok ? {} : {message: createToolVersionMismatchMessage({name, expected, actual, ...guidance})})}
}

async function hasMiseConfig(repoRoot: string): Promise<boolean> {
	return (await pathExists(path.join(repoRoot, 'mise.toml'))) || (await pathExists(path.join(repoRoot, '.mise.toml')))
}

async function miseAvailable(repoRoot: string): Promise<boolean> {
	try {
		await captureCommand(commandName('mise'), ['--version'], {cwd: repoRoot, env: process.env})
		return true
	} catch {
		return false
	}
}

async function readToolVersionStatuses(repoRoot: string): Promise<{node: ToolVersionStatus; bun: ToolVersionStatus}> {
	const [expectedNode, expectedBun, actualNode, actualBun, repoHasMiseConfig] = await Promise.all([readExpectedNodeVersion(repoRoot), readExpectedBunVersion(repoRoot), actualVersion('node', repoRoot), actualVersion('bun', repoRoot), hasMiseConfig(repoRoot)])
	const guidance = {hasMiseConfig: repoHasMiseConfig, miseAvailable: repoHasMiseConfig ? await miseAvailable(repoRoot) : false}
	return {node: versionStatus('node', expectedNode, actualNode, guidance), bun: versionStatus('bun', expectedBun, actualBun, guidance)}
}

function assertRequiredToolVersions(tools: {node: ToolVersionStatus; bun: ToolVersionStatus}): void {
	const failures = [tools.node, tools.bun].filter(tool => !tool.ok)
	if (failures.length === 0) return

	for (const failure of failures) {
		console.error(`[FAIL] ${failure.name} version: expected ${failure.expected}, got ${failure.actual ?? 'missing'}`)
	}
	console.error(`Install Node ${tools.node.expected} and Bun ${tools.bun.expected}, then rerun bun run bootstrap.`)
	throw new Error('Required tool versions do not match')
}

function createRequireFromRepo(repoRoot: string): NodeJS.Require {
	return createRequire(path.join(repoRoot, 'package.json'))
}

async function checkElectronPayload(repoRoot: string): Promise<ElectronPayloadStatus> {
	const packageLinkDir = path.join(repoRoot, 'node_modules', 'electron')
	const packageJsonPath = path.join(packageLinkDir, 'package.json')
	let packageDir = packageLinkDir
	try {
		await fs.access(packageJsonPath, fsConstants.F_OK)
		packageDir = await fs.realpath(packageLinkDir)
	} catch (error) {
		return {ok: false, message: `electron package is not installed at ${packageJsonPath}: ${error instanceof Error ? error.message : String(error)}`}
	}

	const pathTxt = path.join(packageDir, 'path.txt')
	let relativeBinaryPath: string
	try {
		relativeBinaryPath = (await readText(pathTxt)).trim()
	} catch {
		return {ok: false, packageDir, message: `missing ${pathTxt}`}
	}

	if (!relativeBinaryPath) {
		return {ok: false, packageDir, message: `${pathTxt} is empty`}
	}

	const binaryPath = path.join(packageDir, 'dist', relativeBinaryPath)
	if (!(await pathExists(binaryPath))) {
		return {ok: false, packageDir, binaryPath, message: `missing Electron binary at ${binaryPath}`}
	}

	if (process.platform !== 'win32') {
		try {
			await fs.access(binaryPath, fsConstants.X_OK)
		} catch {
			return {ok: false, packageDir, binaryPath, message: `Electron binary is not executable at ${binaryPath}`}
		}
	}

	return {ok: true, packageDir, binaryPath}
}

async function repairElectronPayload(repoRoot: string, env: NodeJS.ProcessEnv): Promise<void> {
	let status = await checkElectronPayload(repoRoot)
	if (status.ok) {
		console.log(`  OK: Electron binary present at ${status.binaryPath}`)
		return
	}

	if (!status.packageDir) {
		throw new Error(`${status.message ?? 'Electron package is not installed'}. Run bun run repair after dependencies are installed.`)
	}

	console.log(`  Electron payload needs repair: ${status.message}`)
	await spawnChecked(commandName('node'), [path.join(status.packageDir, 'install.js')], {cwd: repoRoot, env})

	status = await checkElectronPayload(repoRoot)
	if (!status.ok) {
		throw new Error(`${status.message ?? 'Electron payload is still missing'}. Try removing node_modules and rerunning bun run bootstrap.`)
	}

	console.log(`  OK: Electron installer repaired binary at ${status.binaryPath}`)
}

async function checkEmbeddedHostPayload(repoRoot: string): Promise<EmbeddedPayloadStatus> {
	try {
		return checkEmbeddedPayload(hostEmbeddedTarget(repoRoot))
	} catch (error) {
		const dir = path.join(repoRoot, 'build', 'embedded', `${process.platform}-${process.arch}`)
		return {ok: false, dir, message: error instanceof Error ? error.message : String(error)}
	}
}

async function ensureEmbeddedHostBinaries(repoRoot: string, env: NodeJS.ProcessEnv): Promise<void> {
	const existing = await checkEmbeddedHostPayload(repoRoot)
	if (existing.ok) {
		console.log(`  OK: embedded host binaries present at ${existing.dir}`)
		return
	}

	console.log(`  Fetching embedded host binaries: ${existing.message}`)
	await spawnChecked(commandName('bun'), ['run', 'embed:fetch:host'], {cwd: repoRoot, env})

	const after = await checkEmbeddedHostPayload(repoRoot)
	if (!after.ok) throw new Error(after.message ?? 'embedded host binaries are still missing')
	console.log(`  OK: embedded host binaries present at ${after.dir}`)
}

async function checkPlaywrightChromium(repoRoot: string): Promise<DoctorCheck> {
	try {
		interface ChromiumBrowserType {
			executablePath(): string
		}

		const require = createRequireFromRepo(repoRoot)
		const {chromium} = require('@playwright/test') as {chromium: ChromiumBrowserType}
		const executablePath = chromium.executablePath()
		await fs.access(executablePath, process.platform === 'win32' ? fsConstants.F_OK : fsConstants.X_OK)
		return {id: 'playwright-chromium', label: 'Playwright Chromium', ok: true, severity: 'required', message: executablePath}
	} catch (error) {
		return {id: 'playwright-chromium', label: 'Playwright Chromium', ok: false, severity: 'required', message: `missing or unusable Playwright Chromium: ${error instanceof Error ? error.message : String(error)}`}
	}
}

async function commandAvailable(command: string, args: string[]): Promise<boolean> {
	try {
		await captureCommand(command, args)
		return true
	} catch {
		return false
	}
}

async function httpResponds(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, {method: 'GET', signal: AbortSignal.timeout(1_000)})
		return response.ok
	} catch {
		return false
	}
}

async function createRuntimeDoctorReport(repoRoot: string): Promise<DoctorReport> {
	const env = await resolveDoctorDevEnv(repoRoot)
	const tools = await readToolVersionStatuses(repoRoot)
	const electronPayload = await checkElectronPayload(repoRoot)
	const embeddedPayload = await checkEmbeddedHostPayload(repoRoot)
	const playwrightChromium = await checkPlaywrightChromium(repoRoot)
	const rendererPortAvailable = await isPortAvailable(env.rendererHost, env.rendererPort)
	const rendererServerResponding = rendererPortAvailable ? false : await httpResponds(`http://${env.rendererHost}:${env.rendererPort}/`)
	const checks: DoctorCheck[] = [
		{id: 'lockfile', label: 'bun.lock', ok: await pathExists(path.join(repoRoot, 'bun.lock')), severity: 'required'},
		{id: 'node-modules', label: 'node_modules', ok: await directoryExists(path.join(repoRoot, 'node_modules')), severity: 'required'},
		{id: 'electron-payload', label: 'Electron payload', ok: electronPayload.ok, severity: 'required', message: electronPayload.message ?? electronPayload.binaryPath},
		{id: 'embedded-host-binaries', label: 'embedded ffmpeg/ffprobe', ok: embeddedPayload.ok, severity: 'required', message: embeddedPayload.message ?? embeddedPayload.dir},
		playwrightChromium,
		{
			id: 'renderer-port',
			label: `renderer port ${env.rendererHost}:${env.rendererPort}`,
			ok: rendererPortAvailable || rendererServerResponding,
			severity: 'required',
			message: rendererPortAvailable ? `source: ${env.rendererPortSource}` : rendererServerResponding ? `source: ${env.rendererPortSource}; renderer already responds` : 'port is already in use'
		},
		{id: 'electron-user-data', label: 'Electron user data path', ok: await directoryExists(env.electronUserData), severity: 'required', message: `${env.electronUserData} (${env.electronUserDataSource})`},
		{id: 'tmp-dir', label: 'temporary directory', ok: await directoryExists(env.tmpDir), severity: 'required', message: `${env.tmpDir} (${env.tmpDirSource})`}
	]

	if (process.platform === 'linux') {
		checks.push({id: 'tar', label: 'tar', ok: await commandAvailable('tar', ['--version']), severity: 'required', message: 'required to extract BtbN tar.xz archives'})
	}

	return createDoctorReport({repoRoot, env, tools, checks})
}

function printStatus(ok: boolean): string {
	return ok ? '[OK]' : '[FAIL]'
}

function printDoctorReport(report: DoctorReport): void {
	console.log(`Repo root: ${report.repoRoot}`)
	console.log(`Renderer: http://${report.env.rendererHost}:${report.env.rendererPort} (${report.env.rendererPortSource})`)
	console.log(`Electron userData: ${report.env.electronUserData} (${report.env.electronUserDataSource})`)
	console.log(`Temp dir: ${report.env.tmpDir} (${report.env.tmpDirSource})`)
	console.log('')
	for (const tool of [report.tools.node, report.tools.bun]) {
		console.log(`${printStatus(tool.ok)} ${tool.name} version: expected ${tool.expected}, got ${tool.actual ?? 'missing'}`)
		if (tool.message && !tool.ok) console.log(`  ${tool.message}`)
	}
	for (const check of report.checks) {
		console.log(`${printStatus(check.ok)} ${check.label}${check.severity === 'optional' ? ' (optional)' : ''}`)
		if (check.message) console.log(`  ${check.message}`)
	}
	if (!report.ok) {
		console.log('')
		console.log('Run `bun run repair` after fixing required host prerequisites.')
	}
}

async function runDoctor(json: boolean): Promise<void> {
	const repoRoot = await findRepoRoot(process.cwd())
	const report = await createRuntimeDoctorReport(repoRoot)
	if (json) {
		console.log(JSON.stringify(report, null, 2))
	} else {
		printDoctorReport(report)
	}
	if (!report.ok) process.exitCode = 1
}

async function assertOverridePortAvailable(env: DevEnvPaths): Promise<void> {
	if (env.rendererPortSource !== 'override') return
	if (await isPortAvailable(env.rendererHost, env.rendererPort)) return
	throw new Error(`ARROXY_RENDERER_PORT ${env.rendererPort} is already in use on ${env.rendererHost}`)
}

export async function assertLauncherPortAvailable(env: DevEnvPaths, launcher: LauncherName): Promise<void> {
	if (launcher === 'browser-test') return
	await assertOverridePortAvailable(env)
}

function isLauncherName(value: string | undefined): value is LauncherName {
	return value === 'electron' || value === 'mock' || value === 'browser-test' || value === 'browser-smoke'
}

async function runBootstrapOrRepair(kind: 'bootstrap' | 'repair'): Promise<void> {
	const repoRoot = await findRepoRoot(process.cwd())
	const env = await resolveRuntimeDevEnv(repoRoot)
	const childEnv = buildChildEnv(env)
	const tools = await readToolVersionStatuses(repoRoot)
	assertRequiredToolVersions(tools)
	await ensureDevDirs(env)

	await runStep('Installing dependencies', () => spawnChecked(commandName('bun'), ['install', '--frozen-lockfile'], {cwd: repoRoot, env: childEnv}))
	await runStep('Rebuilding native Electron app dependencies', () => spawnChecked(commandName('bun'), ['run', 'electron-builder', 'install-app-deps'], {cwd: repoRoot, env: childEnv}))
	await runStep('Verifying Electron payload', () => repairElectronPayload(repoRoot, childEnv))
	await runStep('Verifying embedded host binaries', () => ensureEmbeddedHostBinaries(repoRoot, childEnv))
	await runStep('Installing Playwright Chromium', () => spawnChecked(commandName('bun'), ['run', 'playwright', 'install', 'chromium'], {cwd: repoRoot, env: childEnv}))

	console.log(`\n${kind} complete`)
	console.log(`Renderer: http://${env.rendererHost}:${env.rendererPort}`)
	console.log(`Electron userData: ${env.electronUserData}`)
	console.log(`Temp dir: ${env.tmpDir}`)
}

function parseElectronLauncherOptions(args: string[]): LauncherEnvOptions & {fresh: boolean} {
	const options: LauncherEnvOptions & {fresh: boolean} = {fresh: false}
	for (const arg of args) {
		if (arg === '--sandbox') {
			options.sandbox = true
			continue
		}
		if (arg === '--fresh') {
			options.fresh = true
			continue
		}
		if (arg === '--gpu=force') {
			options.gpu = 'force'
			continue
		}
		if (arg === '--gpu=swiftshader') {
			options.gpu = 'swiftshader'
			continue
		}
		throw new Error(`Unknown electron launcher option: ${arg}`)
	}
	return options
}

function applyElectronLauncherEnv(env: NodeJS.ProcessEnv, options: LauncherEnvOptions): NodeJS.ProcessEnv {
	const childEnv = {...env}
	if (options.sandbox) delete childEnv.ELECTRON_DISABLE_SANDBOX
	else childEnv.ELECTRON_DISABLE_SANDBOX = '1'

	if (options.gpu === 'force') childEnv.ARROXY_GPU_MODE = 'force'
	if (options.gpu === 'swiftshader') {
		childEnv.ARROXY_GPU_MODE = 'swiftshader'
		childEnv.ARROXY_BACKDROP_SOFTWARE = '1'
	}

	return childEnv
}

async function clearFreshMainLog(env: DevEnvPaths): Promise<void> {
	await fs.rm(path.join(env.electronUserData, 'logs', 'main.log'), {force: true})
}

async function runLauncher(args: string[]): Promise<void> {
	const [launcher, ...launcherArgs] = args
	if (!isLauncherName(launcher)) throw new Error('usage: bun scripts/dev-env.ts run <electron|mock|browser-test|browser-smoke>')
	const repoRoot = await findRepoRoot(process.cwd())
	const env = await resolveRuntimeDevEnv(repoRoot)
	await assertLauncherPortAvailable(env, launcher)
	await ensureDevDirs(env)
	const baseEnv = buildChildEnv(env)

	if (launcher === 'electron') {
		const options = parseElectronLauncherOptions(launcherArgs)
		if (options.fresh) await clearFreshMainLog(env)
		await ensureEmbeddedHostBinaries(repoRoot, baseEnv)
		await spawnChecked(commandName('bun'), ['run', 'electron-vite', 'dev'], {cwd: repoRoot, env: applyElectronLauncherEnv(baseEnv, options)})
		return
	}

	if (launcherArgs.length > 0) throw new Error(`Unexpected arguments for ${launcher}: ${launcherArgs.join(' ')}`)

	if (launcher === 'mock') {
		await spawnChecked(commandName('bun'), ['run', 'vite', 'src/renderer', '--host', env.rendererHost, '--port', String(env.rendererPort), '--strictPort', '--config', 'src/renderer/vite.config.mjs', '--mode', 'browser-mock'], {cwd: repoRoot, env: baseEnv})
		return
	}

	if (launcher === 'browser-test') {
		await spawnChecked(commandName('bun'), ['run', 'playwright', 'test', '--config', 'playwright.browser.config.ts'], {cwd: repoRoot, env: baseEnv})
		return
	}

	if (launcher === 'browser-smoke') {
		await spawnChecked(commandName('bun'), ['run', 'playwright', 'test', 'tests/browser/dev-smoke.spec.ts', '--config', 'playwright.browser.config.ts'], {cwd: repoRoot, env: baseEnv})
		return
	}

	throw new Error('usage: bun scripts/dev-env.ts run <electron|mock|browser-test|browser-smoke>')
}

function normalizeFileUrlForComparison(href: string): string {
	return href.replace(/^file:\/\/\/([a-zA-Z]):/, (_match, drive: string) => `file:///${drive.toUpperCase()}:`)
}

function pathLikeToFileUrl(value: string): string {
	return pathToFileURL(value).href
}

function isCliEntrypoint(meta: Pick<ImportMeta, 'url'> & {main?: boolean}, argvPath: string | undefined = process.argv[1]): boolean {
	if (meta.main === true) return true
	if (!argvPath) return false
	return normalizeFileUrlForComparison(meta.url) === normalizeFileUrlForComparison(pathLikeToFileUrl(argvPath))
}

async function main(args: string[]): Promise<void> {
	const [command, ...rest] = args
	if (command === 'bootstrap') {
		if (rest.length > 0) throw new Error('usage: bun scripts/dev-env.ts bootstrap')
		await runBootstrapOrRepair('bootstrap')
		return
	}

	if (command === 'repair') {
		if (rest.length > 0) throw new Error('usage: bun scripts/dev-env.ts repair')
		await runBootstrapOrRepair('repair')
		return
	}

	if (command === 'doctor') {
		const allowed = new Set(['--json'])
		for (const arg of rest) {
			if (!allowed.has(arg)) throw new Error(`Unknown doctor option: ${arg}`)
		}
		await runDoctor(rest.includes('--json'))
		return
	}

	if (command === 'run') {
		await runLauncher(rest)
		return
	}

	throw new Error('usage: bun scripts/dev-env.ts <bootstrap|repair|doctor|run>')
}

if (isCliEntrypoint(import.meta)) {
	main(process.argv.slice(2)).catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exit(1)
	})
}
