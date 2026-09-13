import {join, win32} from 'node:path'
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

	// A UNC share is reported as `\\?\UNC\server\share`. Stripping only the `\\?\`
	// prefix leaves `UNC\server\share`, which never equals the share path, so on a
	// network output folder every job would look like it created the root.
	it('turns an extended UNC path back into an ordinary UNC path', () => {
		expect(normalizeCreatedPath('\\\\?\\UNC\\server\\share\\.arroxy-temp')).toBe('\\\\server\\share\\.arroxy-temp')
	})

	// Pinned to Node's own mapping rather than hand-written prefixes: whatever
	// `toNamespacedPath` does to a path, normalizing must undo it exactly, or the
	// created-path comparison in `setupTempDir` silently stops matching.
	it.each([
		['drive path', 'C:\\Users\\Admin\\Downloads\\.arroxy-temp\\aaaaaaaa'],
		['UNC share', '\\\\server\\share\\Videos\\.arroxy-temp\\aaaaaaaa'],
		['UNC admin share', '\\\\localhost\\C$\\Temp\\.arroxy-temp\\aaaaaaaa']
	])('round-trips a %s through Windows namespacing', (_label, path) => {
		expect(normalizeCreatedPath(win32.toNamespacedPath(path))).toBe(path)
	})
})
