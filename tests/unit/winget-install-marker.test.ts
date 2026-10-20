import {readFileSync} from 'node:fs'
import {describe, expect, it} from 'vite-plus/test'
import {WINGET_MARKER_FILE} from '@main/installChannel.js'

// The WinGet channel spans three places that share no code: the WinGet
// manifest passes --winget, the NSIS script turns it into a marker file, and
// detectInstallChannel looks for that file. This pins the script to the app.
const script = readFileSync(new URL('../../build/installer.nsh', import.meta.url), 'utf8')

describe('NSIS WinGet install marker', () => {
	it('reads the switch WinGet passes', () => {
		expect(script).toContain('${GetOptions} $R0 "--winget" $R1')
	})

	it('writes the marker detectInstallChannel looks for, beside the executable', () => {
		expect(script).toContain(`"$INSTDIR\\${WINGET_MARKER_FILE}"`)
	})

	it('forgets the WinGet origin only on a real uninstall, never during an update', () => {
		const uninstall = /!macro customUnInstall([\s\S]*?)!macroend/.exec(script)?.[1] ?? ''
		expect(uninstall).toMatch(/\$\{ifNot\} \$\{isUpdated\}[\s\S]*DeleteRegValue/)
	})
})
