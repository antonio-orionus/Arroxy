import {app, BrowserWindow} from 'electron'

const forceGpuSwitches = ['ignore-gpu-blocklist', 'enable-gpu-rasterization']
const swiftShaderSwitches = ['ignore-gpu-blocklist', 'enable-unsafe-swiftshader', 'use-angle=swiftshader']

function parseMode(argv) {
	const modeArg = argv.find(arg => arg.startsWith('--mode='))
	const mode = modeArg ? modeArg.slice('--mode='.length) : 'auto'
	if (!['auto', 'force', 'software', 'swiftshader'].includes(mode)) {
		throw new Error(`Unknown --mode=${mode}. Use auto, force, software, or swiftshader.`)
	}
	return mode
}

function appendSwitch(rawSwitch) {
	const [name, ...valueParts] = rawSwitch.split('=')
	const value = valueParts.join('=')
	app.commandLine.appendSwitch(name, value === '' ? undefined : value)
}

function applyMode(mode) {
	if (mode === 'force') {
		for (const commandLineSwitch of forceGpuSwitches) appendSwitch(commandLineSwitch)
		return {mode, switches: forceGpuSwitches}
	}
	if (mode === 'swiftshader') {
		for (const commandLineSwitch of swiftShaderSwitches) appendSwitch(commandLineSwitch)
		return {mode, switches: swiftShaderSwitches}
	}
	if (mode === 'software') {
		app.disableHardwareAcceleration()
		return {mode, switches: [], disableHardwareAcceleration: true}
	}
	return {mode, switches: []}
}

async function probeRendererWebgl() {
	const window = new BrowserWindow({show: false, webPreferences: {contextIsolation: true, nodeIntegration: false}})
	try {
		await window.loadURL('data:text/html,<meta charset="utf-8"><title>gpu probe</title>')
		return await window.webContents.executeJavaScript(`
			(() => {
				const canvas = document.createElement('canvas')
				const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
				if (!gl) return {hasWebgl: false}
				const ext = gl.getExtension('WEBGL_debug_renderer_info')
				return {
					hasWebgl: true,
					renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'masked',
					vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'masked'
				}
			})()
		`)
	} finally {
		window.destroy()
	}
}

async function main() {
	const mode = parseMode(process.argv.slice(2))
	const applied = applyMode(mode)
	await app.whenReady()
	const gpuInfo = await app.getGPUInfo('basic')
	const rendererWebgl = await probeRendererWebgl()
	const result = {platform: process.platform, electron: process.versions.electron, chrome: process.versions.chrome, applied, features: app.getGPUFeatureStatus(), gpuInfo, rendererWebgl}
	console.log(JSON.stringify(result, null, 2))
}

main()
	.catch(error => {
		console.error(error instanceof Error ? error.message : String(error))
		process.exitCode = 1
	})
	.finally(() => app.quit())
