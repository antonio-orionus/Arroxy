import {describe, expect, it} from 'vitest'

import {isExternalMainBuildImport, isExternalPreloadBuildImport, readRendererDevServerPort} from '../../electron.vite.config.js'

describe('electron.vite.config', () => {
	it('bundles main-process npm dependencies while keeping electron and node builtins external', () => {
		expect(isExternalMainBuildImport('electron')).toBe(true)
		expect(isExternalMainBuildImport('electron/main')).toBe(true)
		expect(isExternalMainBuildImport('node:path')).toBe(true)
		expect(isExternalMainBuildImport('@main/services/QueueService')).toBe(false)
		expect(isExternalMainBuildImport('@shared/types')).toBe(false)
		expect(isExternalMainBuildImport('./relative-module')).toBe(false)
		expect(isExternalMainBuildImport('electron-log/main')).toBe(false)
		expect(isExternalMainBuildImport('make-fetch-happen')).toBe(false)
		expect(isExternalMainBuildImport('cacache')).toBe(false)
	})

	it('still externalizes preload npm dependencies', () => {
		expect(isExternalPreloadBuildImport('electron')).toBe(true)
		expect(isExternalPreloadBuildImport('electron/main')).toBe(true)
		expect(isExternalPreloadBuildImport('node:fs')).toBe(true)
		expect(isExternalPreloadBuildImport('@preload/api')).toBe(false)
		expect(isExternalPreloadBuildImport('@shared/ipc')).toBe(false)
		expect(isExternalPreloadBuildImport('./relative-module')).toBe(false)
		expect(isExternalPreloadBuildImport('electron-log/main')).toBe(true)
	})

	// Regression: alias plugin rewrites `@shared/...` to an absolute path before
	// the external callback fires. On Windows that surfaces as `D:\\...` /
	// `C:/...`. Treating those as external left raw `require('D:\\a\\...')`
	// calls in the bundled preload, breaking every downstream machine
	// (CI-built v0.3.2-beta.6 portable failed with `module not found:
	// D:\\a\\Arroxy\\Arroxy\\src\\shared/ipc.js`).
	it('treats Windows absolute paths as internal', () => {
		expect(isExternalPreloadBuildImport('D:\\a\\Arroxy\\Arroxy\\src\\shared\\ipc.js')).toBe(false)
		expect(isExternalPreloadBuildImport('D:/a/Arroxy/Arroxy/src/shared/ipc.js')).toBe(false)
		expect(isExternalPreloadBuildImport('C:\\work\\arroxy\\src\\preload\\createPreloadApi.ts')).toBe(false)
		expect(isExternalMainBuildImport('D:\\a\\Arroxy\\Arroxy\\src\\shared\\types.ts')).toBe(false)
		expect(isExternalMainBuildImport('C:/work/arroxy/src/main/index.ts')).toBe(false)
	})

	it('reads the renderer dev-server port from ARROXY_RENDERER_PORT', () => {
		expect(readRendererDevServerPort({})).toBe(5173)
		expect(readRendererDevServerPort({ARROXY_RENDERER_PORT: '23456'})).toBe(23_456)
		expect(() => readRendererDevServerPort({ARROXY_RENDERER_PORT: 'abc'})).toThrow(/ARROXY_RENDERER_PORT/)
		expect(() => readRendererDevServerPort({ARROXY_RENDERER_PORT: '70000'})).toThrow(/ARROXY_RENDERER_PORT/)
	})
})
