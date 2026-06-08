import {describe, expect, it} from 'vitest'

import {findUnsafePreloadRequires} from '../../scripts/check-preload-bundle.js'

describe('preload bundle checker', () => {
	it('accepts intentional Electron and Node runtime imports', () => {
		expect(
			findUnsafePreloadRequires(`
        const electron = require("electron");
        const path = require("node:path");
      `)
		).toEqual([])
	})

	it('rejects machine-local and source imports that should have been bundled', () => {
		const findings = findUnsafePreloadRequires(`
      require("D:\\\\a\\\\Arroxy\\\\Arroxy\\\\src\\\\shared\\\\ipc.js");
      require("C:/work/arroxy/src/preload/createPreloadApi.js");
      require("/tmp/arroxy/src/shared/ipc.js");
      require("@shared/ipc.js");
      require("@preload/createPreloadApi.js");
      require("./createPreloadApi.js");
    `)

		expect(findings.map(finding => finding.specifier)).toEqual(['D:\\\\a\\\\Arroxy\\\\Arroxy\\\\src\\\\shared\\\\ipc.js', 'C:/work/arroxy/src/preload/createPreloadApi.js', '/tmp/arroxy/src/shared/ipc.js', '@shared/ipc.js', '@preload/createPreloadApi.js', './createPreloadApi.js'])
	})
})
