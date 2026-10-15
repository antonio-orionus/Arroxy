import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {z} from 'zod'

// Linux desktops tie a running window to its launcher by comparing the
// window's app_id (Wayland) / WM_CLASS (X11) with the .desktop file's name or
// its StartupWMClass. Electron takes that id from package.json `desktopName`,
// and electron-builder writes StartupWMClass from the same field, so all
// three must agree or the window shows a generic icon and its own taskbar
// group. Verified on the Ubuntu VM with `scripts/vm/ubu-vm.sh app-id`; see
// dev-docs/linux-vm-testing.md.

const root = process.cwd()
const read = (path: string): string => readFileSync(join(root, path), 'utf8')

const packageJsonSchema = z.object({desktopName: z.string().optional()})
const builderConfigSchema = z.object({linux: z.object({syncDesktopName: z.boolean().optional()}).optional()})

function desktopEntryValue(desktopFile: string, key: string): string | undefined {
	return desktopFile
		.split('\n')
		.find(line => line.startsWith(`${key}=`))
		?.slice(key.length + 1)
}

describe('Linux desktop identity', () => {
	const {desktopName} = packageJsonSchema.parse(JSON.parse(read('package.json')))
	const builder = builderConfigSchema.parse(JSON.parse(read('electron-builder.json5')))
	const windowId = desktopName?.replace(/\.desktop$/, '')

	it('package.json names the desktop entry, which sets the window app_id', () => {
		expect(desktopName).toBe('arroxy.desktop')
	})

	it('electron-builder names the AppImage desktop entry after desktopName', () => {
		expect(builder.linux?.syncDesktopName).toBe(true)
	})

	// GNOME tries StartupWMClass before anything else, so a class on the Flatpak
	// entry claims every `arroxy` window — an AppImage or tar.gz running next to
	// the Flatpak would show up under the Flatpak's launcher. The Flatpak window
	// is matched through its sandbox app id instead (scripts/vm/ubu-window-test.sh).
	it('the Flatpak desktop entry does not claim windows by class', () => {
		const flatpakDesktop = read('flatpak/io.github.antonio_orionus.Arroxy.desktop')
		expect(windowId).toBe('arroxy')
		expect(desktopEntryValue(flatpakDesktop, 'StartupWMClass')).toBeUndefined()
	})
})
