export interface UserDataPaths {
	getPath(name: 'userData'): string
	setPath(name: 'userData', path: string): void
}

/**
 * Moves the profile to `ELECTRON_USER_DATA` when it is set (smoke modes, E2E,
 * dev:anon, VM tests) and returns the profile path this run uses. Has to run
 * before anything reads the profile or logs, so a scratch run never touches the
 * real install's settings, queue or log.
 */
export function applyUserDataOverride(paths: UserDataPaths, env: Readonly<Record<string, string | undefined>>): string {
	const override = env.ELECTRON_USER_DATA
	if (override) paths.setPath('userData', override)
	return paths.getPath('userData')
}
