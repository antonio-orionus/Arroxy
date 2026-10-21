import {vi} from 'vite-plus/test'

// Loads a module the way a release build evaluates it: Vite's MODE is
// `production` and VITE_RELEASE_FLAGS unset, so every unreleased flag is off.
// The module reads the flags at import, so the load must be a fresh import
// inside the callback. Undo it in afterEach with vi.unstubAllEnvs() and
// vi.resetModules().
export async function importWithReleaseFlagsOff<T>(load: () => Promise<T>): Promise<T> {
	vi.stubEnv('MODE', 'production')
	vi.stubEnv('VITE_RELEASE_FLAGS', '')
	vi.resetModules()
	return load()
}
