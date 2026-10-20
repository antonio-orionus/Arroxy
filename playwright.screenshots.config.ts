import {defineConfig} from '@playwright/test'

// README screenshots (`bun run screenshots:readme`). Renders the browser-mock
// renderer with showcase content and writes each shot into build/, where the
// README and readme-src/template.md reference them. Not part of `bun run check`.

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
	testDir: './tests/screenshots',
	timeout: 60_000,
	// Every shot is its own page, so they run side by side.
	fullyParallel: true,
	workers: 6,
	reporter: 'list',
	// Reduced motion makes the backdrop draw one still frame instead of animating, so parallel pages don't fight over the CPU.
	use: {baseURL, headless: true, viewport: {width: 900, height: 760}, deviceScaleFactor: 2, colorScheme: 'dark', reducedMotion: 'reduce'},
	webServer: {command: `bun run vp dev src/renderer --host 127.0.0.1 --port ${port} --strictPort --config src/renderer/vite.config.mjs --mode browser-mock`, url: baseURL, reuseExistingServer: true, timeout: 30_000}
})
