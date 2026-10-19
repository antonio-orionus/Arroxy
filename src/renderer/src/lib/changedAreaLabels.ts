import type {ChangedArea} from '../store/wizard/profileApplication.js'

// How a changed area is named in running text: "Changed from Balanced: subtitles, folder".
export const AREA_LABEL_KEYS = {format: 'wizard.review.areas.format', subtitles: 'wizard.review.areas.subtitles', sponsorBlock: 'wizard.review.areas.sponsorBlock', extras: 'wizard.review.areas.extras', saveTo: 'wizard.review.areas.saveTo', fileName: 'wizard.review.areas.fileName'} as const satisfies Record<
	ChangedArea,
	string
>
