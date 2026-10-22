import type {SetupProgress} from '../../store/warmupDownloads.js'

const TITLE_KEY = {firstRun: 'splash.setup.title.firstRun', media: 'splash.setup.title.media', engine: 'splash.setup.title.engine', both: 'splash.setup.title.both'} as const

// Who is waiting decides the heading: a first launch is setting Arroxy up; a
// returning user is getting one or both of the tools updated.
function audience(setup: SetupProgress, returning: boolean): keyof typeof TITLE_KEY {
	if (!returning) return 'firstRun'
	const engine = setup.groups.includes('engine')
	const media = setup.groups.includes('media')
	if (engine && media) return 'both'
	return media ? 'media' : 'engine'
}

export function setupTitleKey(setup: SetupProgress, returning: boolean): (typeof TITLE_KEY)[keyof typeof TITLE_KEY] {
	return TITLE_KEY[audience(setup, returning)]
}
