import type {DownloadProfile, SponsorBlockMode} from '@shared/types.js'

type EmbedField = keyof DownloadProfile['embed']

// The extras a download can add, keyed by the profile's embed field: one label
// and help text each, for the editor switches and every summary of them.
export const EMBED_OPTION_KEYS = {
	chapters: {labelKey: 'wizard.output.embedChapters.label', descriptionKey: 'wizard.output.embedChapters.description'},
	metadata: {labelKey: 'wizard.output.embedMetadata.label', descriptionKey: 'wizard.output.embedMetadata.description'},
	thumbnail: {labelKey: 'wizard.output.embedThumbnail.label', descriptionKey: 'wizard.output.embedThumbnail.description'},
	description: {labelKey: 'wizard.output.writeDescription.label', descriptionKey: 'wizard.output.writeDescription.description'},
	thumbnailSidecar: {labelKey: 'wizard.output.writeThumbnail.label', descriptionKey: 'wizard.output.writeThumbnail.description'}
} as const satisfies Record<EmbedField, {labelKey: string; descriptionKey: string}>

// The order every summary lists the extras in.
export const EMBED_FIELDS = ['chapters', 'metadata', 'thumbnail', 'description', 'thumbnailSidecar'] as const satisfies readonly EmbedField[]

export const SPONSOR_BLOCK_MODE_LABEL_KEYS = {off: 'wizard.sponsorblock.mode.off', mark: 'wizard.sponsorblock.mode.mark', remove: 'wizard.sponsorblock.mode.remove'} as const satisfies Record<SponsorBlockMode, string>
