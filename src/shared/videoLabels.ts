import type {ParseKeys} from 'i18next'
import type {AiUpscaled} from './schemas.js'
import type {HdrSetting, NativeAudioPreference, VideoCodecPreference, VideoFileType} from './types.js'

// The words for a profile's video settings, shared by the editor's controls and
// every summary of a profile.

export const FILE_TYPE_LABEL_KEYS = {auto: 'fileType.auto', mp4: 'fileType.mp4', mkv: 'fileType.mkv', webm: 'fileType.webm'} as const satisfies Record<VideoFileType, ParseKeys>

export const VIDEO_CODEC_LABEL_KEYS = {auto: 'videoCodec.auto', vp9: 'videoCodec.vp9', h264: 'videoCodec.h264'} as const satisfies Record<VideoCodecPreference | 'auto', ParseKeys>

export const HDR_LABEL_KEYS = {auto: 'hdrPreference.auto', sdr: 'hdrPreference.sdr', hdr: 'hdrPreference.hdr'} as const satisfies Record<HdrSetting, ParseKeys>

export const AI_UPSCALED_LABEL_KEYS = {skip: 'aiUpscaled.skip', allow: 'aiUpscaled.allow'} as const satisfies Record<AiUpscaled, ParseKeys>

export const NATIVE_AUDIO_LABEL_KEYS = {compatible: 'wizard.url.nativeAudioPreference.compatible', surround: 'wizard.url.nativeAudioPreference.surround'} as const satisfies Record<NativeAudioPreference, ParseKeys>
