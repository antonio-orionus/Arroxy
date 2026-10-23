import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {audioCodecName, videoCodecName, webmBlocker} from '@shared/fileTypeFit.js'
import {VIDEO_FILE_TYPES} from '@shared/schemas.js'
import {EXTRACTED_AUDIO_CONTAINER} from '@shared/thumbnailEmbed.js'
import type {VideoFileType} from '@shared/types.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {resolveOutputContainer} from '../../../store/wizard/resolveContainer.js'
import {Badge} from '../../ui/badge.js'
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../../ui/select.js'
import {Tooltip, TooltipContent, TooltipTrigger} from '../../ui/tooltip.js'

const FILE_TYPE_LABEL_KEYS = {auto: 'fileType.auto', mp4: 'fileType.mp4', mkv: 'fileType.mkv', webm: 'fileType.webm'} as const satisfies Record<VideoFileType, string>
const FILE_TYPE_DESCRIPTION_KEYS = {auto: 'fileType.description.auto', mp4: 'fileType.description.mp4', mkv: 'fileType.description.mkv', webm: 'fileType.description.webm'} as const satisfies Record<VideoFileType, string>

function isFileType(value: unknown): value is VideoFileType {
	return VIDEO_FILE_TYPES.some(fileType => fileType === value)
}

// "Saves as .mkv · AV1 · Opus": the file this download becomes, and a menu to
// change its file type for this one download. Options follow the picked
// streams, so WebM is offered only when they fit it.
export function SavesAsControl(): ReactNode {
	const {t} = useTranslation()
	const {mediaKind, videoId, audioSelection, formats, subtitleMode, embedThumbnail, fileType, profileFileType, setFileType} = useAppStore(
		useShallow(state => ({
			mediaKind: state.wizardMediaKind,
			videoId: state.selectedVideoFormatId,
			audioSelection: state.audioSelection,
			formats: state.wizardFormats,
			// Embed muxes into an .mkv only when a language is picked: with none, no subtitles run.
			subtitleMode: state.wizardSubtitleLanguages.length > 0 ? state.wizardSubtitleMode : 'sidecar',
			embedThumbnail: state.wizardEmbedThumbnail,
			fileType: state.wizardFileType,
			profileFileType: state.wizardProfileBaseline?.fileType ?? null,
			setFileType: state.setWizardFileType
		}))
	)
	if (mediaKind === 'audio') {
		// An audio download has no file type to choose: it is the stream's own, or the conversion's.
		// No line when yt-dlp names it at download, from a codec only ffprobe finds.
		const audioExt = resolveOutputContainer('', audioSelection, subtitleMode, formats, mediaKind, embedThumbnail, 'auto')
		if (audioExt === 'unknown' || audioExt === EXTRACTED_AUDIO_CONTAINER) return null
		return (
			<span className="inline-flex items-center gap-x-2" data-testid="saves-as">
				<span>{t('wizard.formats.savesAs.label')}</span>
				<span className="font-medium text-foreground">.{audioExt}</span>
			</span>
		)
	}
	if (mediaKind !== 'video' || videoId === '') return null

	const video = formats.find(f => f.formatId === videoId)
	const audio = audioSelection.kind === 'native' ? formats.find(f => f.formatId === audioSelection.formatId) : undefined
	const blocker = webmBlocker(video, audio)
	const autoExt = resolveOutputContainer(videoId, audioSelection, subtitleMode, formats, mediaKind, embedThumbnail, 'auto')
	const ext = resolveOutputContainer(videoId, audioSelection, subtitleMode, formats, mediaKind, embedThumbnail, fileType)
	const codecs = [videoCodecName(video?.videoCodec), audioCodecName(audio?.audioCodec ?? (video && !video.isVideoOnly ? video.audioCodec : undefined))].filter((codec): codec is string => codec !== null)

	function optionLabel(option: VideoFileType): string {
		const label = option === 'auto' ? t('fileType.autoValue', {ext: autoExt}) : t(FILE_TYPE_LABEL_KEYS[option])
		return option === profileFileType ? `${label} · ${t('fileType.profileMark')}` : label
	}

	return (
		<span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1" data-testid="saves-as">
			{/* A narrow footer keeps Total and the file type on one line: the label is still read aloud. */}
			<span className="max-lg:sr-only">{t('wizard.formats.savesAs.label')}</span>
			<Select
				value={fileType}
				onValueChange={next => {
					if (isFileType(next)) setFileType(next)
				}}
			>
				<SelectTrigger size="sm" className="min-w-28" data-testid="saves-as-trigger" aria-label={t('wizard.formats.savesAs.label')}>
					{/* Auto, or a choice something overrides (embedded subtitles make an .mkv), names the file it makes. */}
					<SelectValue>{(selected: unknown) => (isFileType(selected) ? (selected === 'auto' || (selected !== ext && ext !== 'unknown') ? `.${ext}` : t(FILE_TYPE_LABEL_KEYS[selected])) : '')}</SelectValue>
				</SelectTrigger>
				<SelectContent align="start" alignItemWithTrigger={false} className="w-auto">
					<SelectGroup>
						{VIDEO_FILE_TYPES.map(option => {
							const blocked = option === 'webm' && blocker !== null
							return (
								<SelectItem key={option} value={option} disabled={blocked} onClick={() => setFileType(option)} data-testid={`saves-as-option-${option}`}>
									<span className="flex flex-col">
										<span>{optionLabel(option)}</span>
										<span className="text-caption font-normal text-subtle-foreground">{blocked ? t('fileType.webmBlocked', {codec: blocker}) : t(FILE_TYPE_DESCRIPTION_KEYS[option])}</span>
									</span>
								</SelectItem>
							)
						})}
					</SelectGroup>
				</SelectContent>
			</Select>
			{codecs.length > 0 ? (
				<Tooltip>
					<TooltipTrigger
						render={props => (
							<Badge {...props} variant="outline" size="sm" className="font-mono max-lg:hidden" tabIndex={0} data-testid="saves-as-codecs">
								{codecs.join(' · ')}
							</Badge>
						)}
					/>
					<TooltipContent className="max-w-72 leading-snug">{t(FILE_TYPE_DESCRIPTION_KEYS[fileType === 'auto' && isFileType(ext) ? ext : fileType])}</TooltipContent>
				</Tooltip>
			) : null}
		</span>
	)
}
