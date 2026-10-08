import {describe, expect, it} from 'vitest'
import {findExternalMainImports} from '../../scripts/check-main-bundle.js'

describe('findExternalMainImports', () => {
	it('allows electron, node: specifiers, bare Node built-ins and sibling chunks', () => {
		const source = ['import { app } from "electron";', 'import fs from "node:fs";', 'const path = __require("path");', 'const fsp = __require("fs/promises");', 'const sd = __require("string_decoder");', 'import { t as __esmMin } from "./index.js";', 'const chunk = await import("./p-map-Cc20ZAOP.js");'].join('\n')

		expect(findExternalMainImports(source)).toEqual([])
	})

	it('flags a bundler-emitted require of an npm package', () => {
		expect(findExternalMainImports('const store = __require("electron-store");')).toEqual([{specifier: 'electron-store', via: '__require'}])
	})

	it('flags static and dynamic imports of npm packages, including subpaths and scopes', () => {
		const source = ['import log from "electron-log";', 'export { x } from "@openpanel/sdk";', 'import "zod/v4";', 'const m = await import("make-fetch-happen");'].join('\n')

		expect(findExternalMainImports(source).map(item => item.specifier)).toEqual(['electron-log', '@openpanel/sdk', 'zod/v4', 'make-fetch-happen'])
	})

	it('ignores require() text inside Ajv code-generation templates', () => {
		const source = 'code: (0, codegen_1._)`require("ajv/dist/runtime/validation_error").default`'

		expect(findExternalMainImports(source)).toEqual([])
	})

	it('flags absolute paths that would break once the app is packaged', () => {
		expect(findExternalMainImports('import x from "/Users/dev/arroxy/node_modules/zod/index.js";').map(item => item.specifier)).toEqual(['/Users/dev/arroxy/node_modules/zod/index.js'])
	})

	it('ignores import and require text inside strings and comments', () => {
		const source = ['const help = "Example: await import(\'zod\')";', 'const doc = \'require("electron-store")\';', '// import log from "electron-log";', '/* export * from "make-fetch-happen"; */'].join('\n')

		expect(findExternalMainImports(source)).toEqual([])
	})

	it('flags compact value-level re-exports', () => {
		expect(findExternalMainImports('export*from"electron-store";').map(item => item.specifier)).toEqual(['electron-store'])
		expect(findExternalMainImports('export*as store from"electron-store";').map(item => item.specifier)).toEqual(['electron-store'])
	})

	it('flags a real require() call of a package', () => {
		expect(findExternalMainImports('const fetch = require("make-fetch-happen");')).toEqual([{specifier: 'make-fetch-happen', via: 'require'}])
	})
})
