import type {DownloadProfile, SponsorBlockMode} from '@shared/types.js'

type EmbedField = keyof DownloadProfile['embed']

// The extras a download can add, keyed by the profile's embed field: the
// switch's label and help text, and a short name for lists of them.
export const EMBED_OPTION_KEYS = {
	chapters: {labelKey: 'wizard.output.embedChapters.label', descriptionKey: 'wizard.output.embedChapters.description', shortKey: 'wizard.output.embedChapters.short'},
	metadata: {labelKey: 'wizard.output.embedMetadata.label', descriptionKey: 'wizard.output.embedMetadata.description', shortKey: 'wizard.output.embedMetadata.short'},
	thumbnail: {labelKey: 'wizard.output.embedThumbnail.label', descriptionKey: 'wizard.output.embedThumbnail.description', shortKey: 'wizard.output.embedThumbnail.short'},
	description: {labelKey: 'wizard.output.writeDescription.label', descriptionKey: 'wizard.output.writeDescription.description', shortKey: 'wizard.output.writeDescription.short'},
	thumbnailSidecar: {labelKey: 'wizard.output.writeThumbnail.label', descriptionKey: 'wizard.output.writeThumbnail.description', shortKey: 'wizard.output.writeThumbnail.short'}
} as const satisfies Record<EmbedField, {labelKey: string; descriptionKey: string; shortKey: string}>

// The order every summary lists the extras in.
export const EMBED_FIELDS = ['chapters', 'metadata', 'thumbnail', 'description', 'thumbnailSidecar'] as const satisfies readonly EmbedField[]

export const SPONSOR_BLOCK_MODE_LABEL_KEYS = {off: 'wizard.sponsorblock.mode.off', mark: 'wizard.sponsorblock.mode.mark', remove: 'wizard.sponsorblock.mode.remove'} as const satisfies Record<SponsorBlockMode, string>
