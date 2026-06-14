import type {FormatOption, NativeAudioPreference} from './types.js'

const EC3_CODECS = new Set(['ec-3', 'e-ac-3', 'eac3'])
const AC3_CODECS = new Set(['ac-3', 'ac3'])
const DOLBY_CODECS = new Set([...EC3_CODECS, ...AC3_CODECS])

function normalizedCodec(format: Pick<FormatOption, 'audioCodec'>): string {
	return format.audioCodec?.toLowerCase() ?? ''
}

export function isDolbyNativeAudio(format: Pick<FormatOption, 'audioCodec'>): boolean {
	return DOLBY_CODECS.has(normalizedCodec(format))
}

function isEc3NativeAudio(format: Pick<FormatOption, 'audioCodec'>): boolean {
	return EC3_CODECS.has(normalizedCodec(format))
}

function isAc3NativeAudio(format: Pick<FormatOption, 'audioCodec'>): boolean {
	return AC3_CODECS.has(normalizedCodec(format))
}

export function isDrcNativeAudio(format: Pick<FormatOption, 'isDrc'>): boolean {
	return format.isDrc === true
}

function firstId(formats: readonly FormatOption[], predicate: (format: FormatOption) => boolean): string | null {
	return formats.find(predicate)?.formatId ?? null
}

function compatibleNativeAudioId(audioFormats: readonly FormatOption[]): string | null {
	return firstId(audioFormats, format => !isDolbyNativeAudio(format) && !isDrcNativeAudio(format)) ?? firstId(audioFormats, format => !isDolbyNativeAudio(format)) ?? firstId(audioFormats, format => !isDrcNativeAudio(format)) ?? audioFormats[0]?.formatId ?? null
}

export function preferredNativeAudioId(audioFormats: readonly FormatOption[], preference: NativeAudioPreference): string | null {
	if (preference === 'surround') {
		return firstId(audioFormats, format => isEc3NativeAudio(format) && !isDrcNativeAudio(format)) ?? firstId(audioFormats, format => isAc3NativeAudio(format) && !isDrcNativeAudio(format)) ?? compatibleNativeAudioId(audioFormats)
	}
	return compatibleNativeAudioId(audioFormats)
}
