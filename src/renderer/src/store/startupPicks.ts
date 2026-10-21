import type {AppSettings} from '@shared/types.js'

// The native menu works over the startup splash, so a language, theme or style
// can be picked while initialize() waits on its first settings read. Those
// picks are newer than what the read returns. Recording the picks themselves,
// not a before/after diff, keeps one that happens to equal the store's starting
// value, or that goes A → B → A.
export type StartupPicks = Partial<Pick<AppSettings['common'], 'language' | 'uiTheme' | 'uiStyle'>>

let picks: StartupPicks | null = null

export function watchStartupPicks(): void {
	picks = {}
}

export function recordStartupPick(pick: StartupPicks): void {
	if (picks) picks = {...picks, ...pick}
}

export function takeStartupPicks(): StartupPicks {
	const taken = picks ?? {}
	picks = null
	return taken
}
