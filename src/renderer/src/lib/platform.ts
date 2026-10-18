/**
 * Which OS's filesystem rules apply.
 *
 * Components read `window.platform` directly because they only ever run with
 * the preload bridge present. Store modules cannot: they are also exercised by
 * node-hosted unit tests, where there is no `window` at all. `process.platform`
 * is the same answer in that environment, so both get the truth rather than a
 * default that would quietly test the wrong platform's limits.
 */
export function hostPlatform(): NodeJS.Platform {
	if (typeof window !== 'undefined' && window.platform) return window.platform
	if (typeof process !== 'undefined' && process.platform) return process.platform
	return 'linux'
}
