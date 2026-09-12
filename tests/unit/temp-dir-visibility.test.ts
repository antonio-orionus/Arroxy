import {join} from 'node:path'
import {describe, expect, it, vi} from 'vitest'
import {createTempDirHider, normalizeCreatedPath} from '@main/services/download/tempDirVisibility.js'

const WIN_ROOT = 'C:\\Users\\Admin\\Downloads\\.arroxy-temp'

describe('createTempDirHider', () => {
	it('marks the given root hidden', async () => {
		const run = vi.fn().mockResolvedValue(undefined)
		await createTempDirHider({platform: 'win32', run})(WIN_ROOT)
		expect(run).toHaveBeenCalledWith('attrib', ['+h', WIN_ROOT])
	})

	it('does nothing off Windows, where the dot prefix already hides it', async () => {
		const run = vi.fn().mockResolvedValue(undefined)
		await createTempDirHider({platform: 'darwin', run})(join('/out', '.arroxy-temp'))
		expect(run).not.toHaveBeenCalled()
	})

	// Cosmetic only: a download must never fail because a folder stayed visible.
	it('swallows a failing attrib', async () => {
		const run = vi.fn().mockRejectedValue(new Error('attrib not found'))
		await expect(createTempDirHider({platform: 'win32', run})(WIN_ROOT)).resolves.toBeUndefined()
	})

	// Verified on a real Windows 11 host: cleanup rmdir's `.arroxy-temp` when a
	// job finalizes, and the recreated directory comes back WITHOUT the Hidden
	// attribute. Anything remembered across that cycle would leave every
	// download after the first with a visible folder, so the hider holds no
	// per-session state and the caller re-hides on each creation.
	it('hides again after the root was removed and recreated', async () => {
		const run = vi.fn().mockResolvedValue(undefined)
		const hide = createTempDirHider({platform: 'win32', run})

		await hide(WIN_ROOT)
		await hide(WIN_ROOT)

		expect(run).toHaveBeenCalledTimes(2)
	})
})

// Measured on a real Windows 11 host: `mkdir(p, {recursive: true})` resolves to
// `\\?\C:\...` while `p` itself is plain, so an unstripped comparison never
// matches and the caller silently stops hiding anything.
describe('normalizeCreatedPath', () => {
	it('strips the Windows extended-length prefix', () => {
		expect(normalizeCreatedPath('\\\\?\\C:\\Users\\Admin\\Downloads\\.arroxy-temp')).toBe('C:\\Users\\Admin\\Downloads\\.arroxy-temp')
	})

	it('leaves a plain Windows path alone', () => {
		expect(normalizeCreatedPath('C:\\Users\\Admin\\Downloads\\.arroxy-temp')).toBe('C:\\Users\\Admin\\Downloads\\.arroxy-temp')
	})

	it('leaves a POSIX path alone', () => {
		expect(normalizeCreatedPath('/out/.arroxy-temp')).toBe('/out/.arroxy-temp')
	})

	// A UNC share is reported as `\\?\UNC\server\share`; stripping the prefix
	// must not turn it into something that accidentally equals another path.
	it('does not corrupt a UNC path into a local-looking one', () => {
		expect(normalizeCreatedPath('\\\\?\\UNC\\server\\share\\.arroxy-temp')).toBe('UNC\\server\\share\\.arroxy-temp')
	})
})
