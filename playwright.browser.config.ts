import {defineConfig} from '@playwright/test'

function readRendererPort(): number {
	const raw = process.env.ARROXY_RENDERER_PORT
	if (!raw) return 5173
	const port = Number(raw)
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`Invalid ARROXY_RENDERER_PORT: ${raw}`)
	}
	return port
}

const port = readRendererPort()
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
	testDir: './tests/browser',
	timeout: 30_000,
	fullyParallel: false,
	workers: 1,
	reporter: 'list',
	use: {baseURL, headless: true},
	webServer: {command: `bun run vite src/renderer --host 127.0.0.1 --port ${port} --strictPort --config src/renderer/vite.config.mjs --mode browser-mock`, url: baseURL, reuseExistingServer: true, timeout: 30_000}
})
