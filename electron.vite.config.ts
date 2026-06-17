import path from 'node:path'
import {createRequire} from 'node:module'
import {defineConfig, loadEnv} from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import Icons from 'unplugin-icons/vite'
import type {PluginOption} from 'vite'

const require = createRequire(import.meta.url)
const {version} = require('./package.json') as {version: string}

// Vite's alias plugin rewrites `@shared/...` / `@preload/...` to the absolute
// resolved path before the `external` callback runs. On POSIX hosts the path
// starts with `/` and matches the relative-import branch. On Windows it is
// `D:\\...` / `C:/...` — those must be treated as internal too, otherwise the
// bundler keeps them as raw `require('D:\\a\\...')` calls that no other
// machine can resolve. CI runner path `D:\\a\\<repo>\\<repo>\\src\\...` was
// the original failure mode (Arroxy v0.3.2-beta.6 release).
const WINDOWS_ABS_PATH = /^[a-zA-Z]:[\\/]/

export function readRendererDevServerPort(env: Record<string, string | undefined> = process.env): number {
	const raw = env.ARROXY_RENDERER_PORT
	if (!raw) return 5173
	const port = Number(raw)
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`Invalid ARROXY_RENDERER_PORT: ${raw}`)
	}
	return port
}

export function isExternalMainBuildImport(id: string): boolean {
	if (id === 'electron' || id.startsWith('electron/')) return true
	if (id.startsWith('node:')) return true
	if (id.startsWith('@main/') || id.startsWith('@shared/')) return false
	if (/^[./]/.test(id)) return false
	if (WINDOWS_ABS_PATH.test(id)) return false
	return false
}

export function isExternalPreloadBuildImport(id: string): boolean {
	if (id === 'electron' || id.startsWith('electron/')) return true
	if (id.startsWith('node:')) return true
	if (id.startsWith('@preload/') || id.startsWith('@shared/')) return false
	if (/^[./]/.test(id)) return false
	if (WINDOWS_ABS_PATH.test(id)) return false
	return true
}

export default defineConfig(({mode}) => {
	// Inline OpenPanel credentials from .env at build time. Without this,
	// process.env.OPENPANEL_CLIENT_ID is undefined in the packaged app (no
	// shell env to read from) and analytics silently never initialize.
	// Empty-string prefix loads all keys regardless of VITE_/MAIN_VITE_ prefix.
	const env = loadEnv(mode, '.', '')
	const openpanelClientId = env.OPENPANEL_CLIENT_ID ?? process.env.OPENPANEL_CLIENT_ID ?? ''
	const openpanelClientSecret = env.OPENPANEL_CLIENT_SECRET ?? process.env.OPENPANEL_CLIENT_SECRET ?? ''
	const arroxyAnalyticsDebug = env.ARROXY_ANALYTICS_DEBUG ?? process.env.ARROXY_ANALYTICS_DEBUG ?? ''
	const rendererDevServerPort = readRendererDevServerPort()

	return {
		main: {
			define: {'process.env.OPENPANEL_CLIENT_ID': JSON.stringify(openpanelClientId), 'process.env.OPENPANEL_CLIENT_SECRET': JSON.stringify(openpanelClientSecret), 'process.env.ARROXY_ANALYTICS_DEBUG': JSON.stringify(arroxyAnalyticsDebug)},
			resolve: {
				alias: [
					{find: '@main', replacement: path.resolve('src/main')},
					{find: '@shared', replacement: path.resolve('src/shared')},
					{find: 'yt-dlp-bridge/parsers', replacement: path.resolve('packages/yt-dlp-bridge/src/parsers.ts')},
					{find: 'yt-dlp-bridge/redaction', replacement: path.resolve('packages/yt-dlp-bridge/src/redaction.ts')},
					{find: 'yt-dlp-bridge', replacement: path.resolve('packages/yt-dlp-bridge/src/index.ts')},
					{find: 'ytdlp-errors', replacement: path.resolve('packages/ytdlp-errors/src/index.ts')}
				]
			},
			build: {
				externalizeDeps: true,
				rollupOptions: {
					// Keep the main bundle self-contained for native ESM on Windows.
					// Electron's main process uses Node's ESM loader, which resolves
					// modules as URLs. When npm deps stay external, packaged asar
					// resolution can surface raw `D:\\...` paths on Windows; Node then
					// rejects them with ERR_UNSUPPORTED_ESM_URL_SCHEME because they are
					// not valid `file://` URLs. Bundling npm deps removes those runtime
					// bare-import resolutions entirely. Only `electron` and `node:*`
					// stay external because the runtime owns them.
					external: (id): boolean => isExternalMainBuildImport(id),
					output: {format: 'es', entryFileNames: '[name].js'}
				}
			}
		},
		preload: {
			define: {__APP_VERSION__: JSON.stringify(version)},
			resolve: {alias: {'@preload': path.resolve('src/preload'), '@shared': path.resolve('src/shared')}},
			// Electron 42 sandboxed preload does not support ESM. Source uses .cts
			// (matches Element-desktop convention: .cts → .cjs is the contract that
			// this file stays CommonJS). electron-vite's findLibEntry only checks
			// {js,ts,mjs,cjs} so we must point lib.entry at the .cts explicitly.
			build: {
				externalizeDeps: true,
				lib: {entry: path.resolve('src/preload/index.cts')},
				rollupOptions: {
					// Same shape as main: rolldown re-bundles deps when output is CJS
					// unless we re-assert externals here. Crucially, `electron` lives in
					// devDependencies so the auto-externalize plugin skips it; without
					// an explicit external the bundler inlines `node_modules/electron`
					// (the npm postinstall shim, NOT the runtime electron module),
					// breaking ipcRenderer/contextBridge at preload load time.
					external: (id): boolean => isExternalPreloadBuildImport(id),
					output: {format: 'cjs', entryFileNames: '[name].cjs'}
				}
			}
		},
		renderer: {
			server: {host: '127.0.0.1', port: rendererDevServerPort, strictPort: true},
			resolve: {alias: {'@renderer': path.resolve('src/renderer/src'), '@shared': path.resolve('src/shared'), 'ytdlp-errors': path.resolve('packages/ytdlp-errors/src/index.ts')}},
			plugins: [react(), tailwindcss(), Icons({compiler: 'jsx', jsx: 'react'}) as PluginOption]
		}
	}
})
