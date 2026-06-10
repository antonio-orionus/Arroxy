import {spawn} from 'node:child_process'
import {mkdirSync, writeFileSync} from 'node:fs'
import {dirname, join, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {chromium} from '@playwright/test'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const defaultUrl = 'http://localhost:5173/?theme=dark&platform=linux&backdrop=1'
const defaultOutputDir = join(repoRoot, 'output', 'perf')
const frameBudgetMs = 1000 / 60

const presets = {laptop: {width: 1366, height: 768, deviceScaleFactor: 1}, desktop: {width: 1920, height: 1080, deviceScaleFactor: 1}, hidpi: {width: 2560, height: 1440, deviceScaleFactor: 1.5}, '4k': {width: 3840, height: 2160, deviceScaleFactor: 1}}

function usage() {
	return [
		'Usage: bun run profile:backdrop [options]',
		'',
		'Options:',
		'  --url=<url>          Target URL. Default: local backdrop stage.',
		'  --duration=<ms>      Sample duration per preset. Default: 8000.',
		'  --warmup=<ms>        Warmup before sampling. Default: 1500.',
		'  --preset=<name>      Preset to run: laptop, desktop, hidpi, 4k. Repeatable.',
		'  --quick              Run only desktop for 5000 ms.',
		'  --headed             Force headed browser.',
		'  --headless           Force headless browser.',
		'  --channel=<name>     Browser channel. Default: chrome. Use chromium to skip branded Chrome.',
		'  --no-server          Do not auto-start bun run dev:mock.',
		'  --output=<file>      JSON report path. Default: output/perf/backdrop-<timestamp>.json.',
		'  --force-gpu-flags    Add Chrome flags that may help on blocklisted GPUs.',
		'  --force-software-renderer',
		'                       Disable hardware acceleration and force the software fallback path.',
		'  --cpu-throttle=<n>   CDP CPU slowdown multiplier. Example: 4.',
		'  --cpu-cores=<n>      Override navigator.hardwareConcurrency for page code.',
		'  --weak-cpu           Shortcut for --force-software-renderer --cpu-cores=2 --cpu-throttle=4.',
		'  --help               Show this help.'
	].join('\n')
}

function parseArgs(argv) {
	const args = {url: defaultUrl, durationMs: 8000, warmupMs: 1500, presetNames: [], headless: null, channel: process.env.ARROXY_PROFILE_CHANNEL ?? 'chrome', autoServer: true, output: null, forceGpuFlags: false, forceSoftwareRenderer: false, cpuThrottleRate: 1, cpuCores: null}

	for (const arg of argv) {
		if (arg === '--help' || arg === '-h') {
			console.log(usage())
			process.exit(0)
		}
		if (arg === '--quick') {
			args.durationMs = 5000
			args.presetNames = ['desktop']
			continue
		}
		if (arg === '--headed') {
			args.headless = false
			continue
		}
		if (arg === '--headless') {
			args.headless = true
			continue
		}
		if (arg === '--no-server') {
			args.autoServer = false
			continue
		}
		if (arg === '--force-gpu-flags') {
			args.forceGpuFlags = true
			continue
		}
		if (arg === '--force-software-renderer') {
			args.forceSoftwareRenderer = true
			continue
		}
		if (arg === '--weak-cpu') {
			args.forceSoftwareRenderer = true
			args.cpuThrottleRate = 4
			args.cpuCores = 2
			continue
		}
		if (arg.startsWith('--url=')) {
			args.url = valueAfterEquals(arg)
			continue
		}
		if (arg.startsWith('--duration=')) {
			args.durationMs = positiveInt(valueAfterEquals(arg), 'duration')
			continue
		}
		if (arg.startsWith('--warmup=')) {
			args.warmupMs = positiveInt(valueAfterEquals(arg), 'warmup')
			continue
		}
		if (arg.startsWith('--channel=')) {
			args.channel = valueAfterEquals(arg)
			continue
		}
		if (arg.startsWith('--cpu-throttle=')) {
			args.cpuThrottleRate = positiveNumber(valueAfterEquals(arg), 'cpu-throttle')
			continue
		}
		if (arg.startsWith('--cpu-cores=')) {
			args.cpuCores = positiveInt(valueAfterEquals(arg), 'cpu-cores')
			continue
		}
		if (arg.startsWith('--preset=')) {
			const name = valueAfterEquals(arg)
			if (!presets[name]) throw new Error(`Unknown preset "${name}". Use one of: ${Object.keys(presets).join(', ')}`)
			args.presetNames.push(name)
			continue
		}
		if (arg.startsWith('--output=')) {
			args.output = resolve(repoRoot, valueAfterEquals(arg))
			continue
		}
		throw new Error(`Unknown option: ${arg}\n\n${usage()}`)
	}

	if (args.presetNames.length === 0) args.presetNames = ['laptop', 'desktop', 'hidpi']
	args.headless ??= defaultHeadless()
	if (args.forceGpuFlags && args.forceSoftwareRenderer) throw new Error('--force-gpu-flags and --force-software-renderer cannot be used together.')
	return args
}

function valueAfterEquals(arg) {
	const index = arg.indexOf('=')
	if (index === -1 || index === arg.length - 1) throw new Error(`Missing value for ${arg}`)
	return arg.slice(index + 1)
}

function positiveInt(raw, label) {
	const value = Number.parseInt(raw, 10)
	if (!Number.isInteger(value) || value <= 0) throw new Error(`--${label} must be a positive integer`)
	return value
}

function positiveNumber(raw, label) {
	const value = Number.parseFloat(raw)
	if (!Number.isFinite(value) || value <= 0) throw new Error(`--${label} must be a positive number`)
	return value
}

function defaultHeadless() {
	if (process.env.ARROXY_PROFILE_HEADLESS === '1') return true
	if (process.env.ARROXY_PROFILE_HEADED === '1') return false
	if (process.platform === 'darwin' || process.platform === 'win32') return false
	return !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY
}

async function fetchOk(url) {
	try {
		const response = await fetch(url, {method: 'GET'})
		return response.ok
	} catch {
		return false
	}
}

async function ensureServer(url, autoServer) {
	const origin = new URL(url).origin
	if (await fetchOk(origin)) return null
	if (!autoServer) throw new Error(`${origin} is not responding. Start bun run dev:mock, or omit --no-server.`)

	const child = spawn(process.platform === 'win32' ? 'bun.cmd' : 'bun', ['run', 'dev:mock'], {cwd: repoRoot, env: process.env, stdio: ['ignore', 'pipe', 'pipe']})

	let output = ''
	child.stdout.on('data', chunk => {
		output += chunk.toString()
	})
	child.stderr.on('data', chunk => {
		output += chunk.toString()
	})

	const deadline = Date.now() + 15_000
	while (Date.now() < deadline) {
		if (await fetchOk(origin)) return child
		if (child.exitCode !== null) break
		await sleep(250)
	}

	child.kill('SIGTERM')
	throw new Error(`Timed out waiting for ${origin}.\n${output.trim()}`)
}

async function launchBrowser(args) {
	const launchArgs = []
	if (args.forceGpuFlags) launchArgs.push('--ignore-gpu-blocklist', '--enable-gpu-rasterization')
	if (args.forceSoftwareRenderer) launchArgs.push('--disable-gpu', '--disable-gpu-compositing', '--disable-accelerated-2d-canvas', '--use-gl=swiftshader')
	const base = {headless: args.headless, args: launchArgs}
	if (args.channel === 'chromium') return {browser: await chromium.launch(base), channel: 'chromium', warnings: []}

	try {
		return {browser: await chromium.launch({...base, channel: args.channel}), channel: args.channel, warnings: []}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)
		const warning = `Could not launch channel "${args.channel}", falling back to bundled chromium. ${firstLine(message)}`
		return {browser: await chromium.launch(base), channel: 'chromium', warnings: [warning]}
	}
}

async function measurePreset(browser, args, presetName) {
	const preset = presets[presetName]
	const context = await browser.newContext({viewport: {width: preset.width, height: preset.height}, deviceScaleFactor: preset.deviceScaleFactor, colorScheme: 'dark', reducedMotion: 'no-preference'})
	if (args.cpuCores !== null) {
		await context.addInitScript(cores => {
			Object.defineProperty(navigator, 'hardwareConcurrency', {configurable: true, get: () => cores})
		}, args.cpuCores)
	}
	const page = await context.newPage()
	const client = await context.newCDPSession(page)
	await client.send('Performance.enable')
	if (args.cpuThrottleRate > 1) await client.send('Emulation.setCPUThrottlingRate', {rate: args.cpuThrottleRate})

	try {
		await page.goto(args.url, {waitUntil: 'domcontentloaded', timeout: 30_000})
		await page.waitForTimeout(args.warmupMs)
		const beforeMetrics = metricsMap(await client.send('Performance.getMetrics'))
		const sample = await page.evaluate(runFrameSample, {durationMs: args.durationMs})
		const afterMetrics = metricsMap(await client.send('Performance.getMetrics'))
		return summarizeSample(presetName, preset, sample, beforeMetrics, afterMetrics, args)
	} finally {
		await context.close()
	}
}

function runFrameSample({durationMs}) {
	function webglInfo() {
		const canvas = document.createElement('canvas')
		const gl = canvas.getContext('webgl') ?? canvas.getContext('experimental-webgl')
		if (!gl) return {renderer: 'unavailable', vendor: 'unavailable'}
		const ext = gl.getExtension('WEBGL_debug_renderer_info')
		return {renderer: ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : 'masked', vendor: ext ? String(gl.getParameter(ext.UNMASKED_VENDOR_WEBGL)) : 'masked'}
	}

	const info = webglInfo()
	const bodyClass = document.body.className
	const canvas = document.querySelector('canvas[data-backdrop-mode]')
	const scene = canvas?.getAttribute('data-backdrop-scene') ?? (bodyClass.includes('backdrop-dark-aurora') ? 'dark-aurora' : bodyClass.includes('backdrop-light-ocean') ? 'light-ocean' : 'unknown')
	const mode = canvas?.getAttribute('data-backdrop-mode') ?? (bodyClass.includes('backdrop-static-fallback') ? 'css-fallback' : 'unknown')
	const cssBeforeAnimation = getComputedStyle(document.body, '::before').animationName
	const cssAfterAnimation = getComputedStyle(document.body, '::after').animationName

	return new Promise(resolve => {
		const frames = []
		let previous = 0
		let start = 0

		function tick(now) {
			if (start === 0) {
				start = now
				previous = now
			} else {
				frames.push(now - previous)
				previous = now
			}
			if (now - start < durationMs) requestAnimationFrame(tick)
			else {
				resolve({
					elapsedMs: now - start,
					frameDeltasMs: frames,
					mode,
					scene,
					bodyClass,
					hasCanvas: Boolean(canvas),
					cssBeforeAnimation,
					cssAfterAnimation,
					renderer: info.renderer,
					vendor: info.vendor,
					devicePixelRatio: window.devicePixelRatio,
					hardwareConcurrency: navigator.hardwareConcurrency,
					userAgent: navigator.userAgent
				})
			}
		}

		requestAnimationFrame(tick)
	})
}

function metricsMap(response) {
	const map = new Map()
	for (const metric of response.metrics ?? []) map.set(metric.name, metric.value)
	return map
}

function summarizeSample(presetName, preset, sample, beforeMetrics, afterMetrics, args) {
	const deltas = sample.frameDeltasMs.filter(value => Number.isFinite(value) && value >= 0)
	const elapsedSec = sample.elapsedMs / 1000
	const sorted = [...deltas].sort((a, b) => a - b)
	const frames = deltas.length
	const avgFps = frames / elapsedSec
	const droppedFrameEstimate = deltas.reduce((total, value) => total + Math.max(0, Math.round(value / frameBudgetMs) - 1), 0)
	const longFrames = deltas.filter(value => value > 50).length
	const taskDurationSec = deltaMetric(beforeMetrics, afterMetrics, 'TaskDuration')
	const mainThreadPct = elapsedSec > 0 ? (taskDurationSec / elapsedSec) * 100 : 0

	const summary = {
		preset: presetName,
		viewport: `${preset.width}x${preset.height}`,
		deviceScaleFactor: preset.deviceScaleFactor,
		mode: sample.mode,
		scene: sample.scene,
		renderer: sample.renderer,
		vendor: sample.vendor,
		devicePixelRatio: sample.devicePixelRatio,
		hardwareConcurrency: sample.hardwareConcurrency,
		forceSoftwareRenderer: args.forceSoftwareRenderer,
		cpuThrottleRate: args.cpuThrottleRate,
		cpuCores: args.cpuCores,
		avgFps,
		medianFrameMs: percentile(sorted, 0.5),
		p95FrameMs: percentile(sorted, 0.95),
		p99FrameMs: percentile(sorted, 0.99),
		droppedFrameEstimate,
		longFrames,
		mainThreadPct,
		frameCount: frames,
		elapsedMs: sample.elapsedMs,
		cssBeforeAnimation: sample.cssBeforeAnimation,
		cssAfterAnimation: sample.cssAfterAnimation,
		bodyClass: sample.bodyClass,
		userAgent: sample.userAgent
	}
	return {...summary, verdict: verdict(summary), warnings: warnings(summary)}
}

function deltaMetric(before, after, name) {
	return Math.max(0, (after.get(name) ?? 0) - (before.get(name) ?? 0))
}

function percentile(sorted, p) {
	if (sorted.length === 0) return 0
	const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1))
	return sorted[index]
}

function isSoftwareRenderer(renderer) {
	return /swiftshader|llvmpipe|software/i.test(renderer)
}

function isSoftwareLike(summary) {
	return summary.forceSoftwareRenderer === true || isSoftwareRenderer(summary.renderer)
}

function meetsFrameBudget(summary) {
	return summary.avgFps >= 55 && summary.p95FrameMs <= 24 && summary.droppedFrameEstimate <= Math.max(3, summary.frameCount * 0.02)
}

function verdict(summary) {
	if (isSoftwareLike(summary)) {
		if (summary.mode !== 'canvas2d') return 'software-webgl'
		return meetsFrameBudget(summary) ? 'fallback-ok' : 'fallback-review'
	}
	if (meetsFrameBudget(summary)) return 'pass'
	return 'review'
}

function warnings(summary) {
	const items = []
	if (summary.forceSoftwareRenderer && !isSoftwareRenderer(summary.renderer)) {
		items.push('Software rendering was forced; WebGL renderer details may be unavailable.')
	}
	if (isSoftwareLike(summary)) {
		items.push(summary.mode === 'canvas2d' ? 'Software renderer detected; Canvas2D fallback is active.' : 'Software renderer is running WebGL.')
	}
	if (!isSoftwareLike(summary) && summary.mode !== 'webgl') items.push('Hardware renderer did not mount WebGL backdrop.')
	if (summary.avgFps < 55) items.push(`Average FPS below 55 (${summary.avgFps.toFixed(1)}).`)
	if (summary.p95FrameMs > 24) items.push(`p95 frame time above 24 ms (${summary.p95FrameMs.toFixed(1)} ms).`)
	if (summary.droppedFrameEstimate > Math.max(3, summary.frameCount * 0.02)) items.push(`Dropped frame estimate is high (${summary.droppedFrameEstimate}).`)
	if (summary.mainThreadPct > 20) items.push(`Main-thread task time is high (${summary.mainThreadPct.toFixed(1)}%).`)
	return items
}

function printReport(report) {
	console.log('')
	console.log('Backdrop performance profile')
	console.log(`URL: ${report.url}`)
	console.log(`Browser: ${report.channel}${report.headless ? ' headless' : ' headed'}`)
	console.log(`Rendering: ${report.forceSoftwareRenderer ? 'forced software' : report.forceGpuFlags ? 'forced GPU flags' : 'default Chrome'}`)
	console.log(`CPU: ${report.cpuCores ?? 'native'} reported cores, ${report.cpuThrottleRate}x throttle`)
	console.log(`Report: ${report.output}`)
	for (const warning of report.launchWarnings) console.log(`Warning: ${warning}`)
	console.log('')
	console.log(['preset'.padEnd(9), 'viewport'.padEnd(11), 'scene'.padEnd(12), 'dpr'.padEnd(5), 'mode'.padEnd(16), 'fps'.padStart(7), 'p95'.padStart(8), 'drop'.padStart(6), 'main'.padStart(7), 'verdict'.padEnd(12)].join(' '))
	for (const item of report.results) {
		console.log(
			[
				item.preset.padEnd(9),
				item.viewport.padEnd(11),
				item.scene.padEnd(12),
				String(item.deviceScaleFactor).padEnd(5),
				item.mode.padEnd(16),
				item.avgFps.toFixed(1).padStart(7),
				`${item.p95FrameMs.toFixed(1)}ms`.padStart(8),
				String(item.droppedFrameEstimate).padStart(6),
				`${item.mainThreadPct.toFixed(1)}%`.padStart(7),
				item.verdict.padEnd(12)
			].join(' ')
		)
	}
	console.log('')
	for (const item of report.results) {
		console.log(`${item.preset}: ${shortRenderer(item.renderer)}`)
		for (const warning of item.warnings) console.log(`  - ${warning}`)
	}
}

function shortRenderer(renderer) {
	return renderer.length > 140 ? `${renderer.slice(0, 137)}...` : renderer
}

function firstLine(value) {
	return value.split(/\r?\n/, 1)[0] ?? value
}

function defaultOutputPath() {
	const stamp = new Date()
		.toISOString()
		.replaceAll(':', '-')
		.replace(/\.\d+Z$/, 'Z')
	return join(defaultOutputDir, `backdrop-${stamp}.json`)
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
	const args = parseArgs(process.argv.slice(2))
	const server = await ensureServer(args.url, args.autoServer)
	const output = args.output ?? defaultOutputPath()
	let browser
	let channel = args.channel
	let launchWarnings = []

	try {
		const launched = await launchBrowser(args)
		browser = launched.browser
		channel = launched.channel
		launchWarnings = launched.warnings
		const results = []
		for (const presetName of args.presetNames) {
			results.push(await measurePreset(browser, args, presetName))
		}

		mkdirSync(dirname(output), {recursive: true})
		const report = {
			createdAt: new Date().toISOString(),
			url: args.url,
			channel,
			headless: args.headless,
			durationMs: args.durationMs,
			warmupMs: args.warmupMs,
			output,
			forceGpuFlags: args.forceGpuFlags,
			forceSoftwareRenderer: args.forceSoftwareRenderer,
			cpuThrottleRate: args.cpuThrottleRate,
			cpuCores: args.cpuCores,
			launchWarnings,
			results
		}
		writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`)
		printReport(report)

		if (results.some(item => item.verdict === 'software-webgl')) process.exitCode = 1
	} finally {
		if (browser) await browser.close()
		if (server) server.kill('SIGTERM')
	}
}

main().catch(error => {
	console.error(error instanceof Error ? error.message : String(error))
	process.exit(1)
})
