// Release flags: work meant for a later release merges to main behind a flag
// that is on in dev, the Scenario Workbench and tests, and off in release
// builds. A flag gates entry points only (a menu item, a button, a route, an
// IPC handler), never the logic behind them. See dev-docs/release-flags.md.

export interface ReleaseFlagDefinition {
	/** What the flag hides, in a few words. */
	summary: string
	/** Set by the one-line PR that ships the work: the flag is then on in release builds too, and deleted in the release after. */
	inRelease: boolean
}

// The one place flags are declared, e.g.
// `batchRename: {summary: 'Batch rename in the queue', inRelease: false}`.
const RELEASE_FLAG_DEFINITIONS = {} satisfies Record<string, ReleaseFlagDefinition>

export type ReleaseFlag = keyof typeof RELEASE_FLAG_DEFINITIONS

const RELEASE_FLAGS: Readonly<Record<string, ReleaseFlagDefinition>> = RELEASE_FLAG_DEFINITIONS

// Release builds are Vite's `production` mode; dev (`development`), the
// Scenario Workbench (`browser-mock`) and Vitest (`test`) are not. A
// production build also turns them on when built with VITE_RELEASE_FLAGS=on,
// which only the fixture E2E scripts do.
export function unreleasedFlagsOn(mode: string, override: string | undefined): boolean {
	return mode !== 'production' || override === 'on'
}

// Vite replaces both reads with literals at build time, in main, preload and
// renderer alike, so a release build never reaches a gated entry point.
export const UNRELEASED_FLAGS_ON = unreleasedFlagsOn(import.meta.env.MODE, import.meta.env.VITE_RELEASE_FLAGS)

export function releaseFlagOn(definition: ReleaseFlagDefinition | undefined, unreleasedOn: boolean): boolean {
	return definition?.inRelease === true || unreleasedOn
}

/** @public Read by gated entry points; none exists while the registry is empty. */
export function isReleaseFlagOn(flag: ReleaseFlag): boolean {
	const name: string = flag
	return releaseFlagOn(RELEASE_FLAGS[name], UNRELEASED_FLAGS_ON)
}
