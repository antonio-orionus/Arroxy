// yt-dlp keeps one argument dict per extractor and *replaces* it when the same
// extractor is given again: `--extractor-args youtube:a=1 --extractor-args
// youtube:b=2` leaves only `b` (options.py `_dict_from_options_callback`,
// append=False). Callers that add their own options to a planned argv must
// therefore merge into the extractor's single block, never append another.

/** One extractor's arguments: each key's values, as `_configuration_arg` reads them. */
export type ExtractorArgValues = Readonly<Record<string, readonly string[]>>

/** Extractor arguments by lower-cased extractor name (`youtube`, `youtubetab`, …). */
export type ExtractorArgs = Readonly<Record<string, ExtractorArgValues>>

const EXTRACTOR_ARGS_FLAG = '--extractor-args'
const EXTRACTOR_NAME = /^([\w-]+):(.*)$/s
const KEY = /^[\w-]+$/

function normalizeKey(key: string): string {
	return key.trim().toLowerCase().replace(/-/g, '_')
}

/** Parses one `--extractor-args` value (`IE:key=v1,v2;key2=v`) with yt-dlp's rules. */
export function parseExtractorArgsBlock(value: string): ExtractorArgs {
	const match = EXTRACTOR_NAME.exec(value)
	const extractor = match?.[1]
	const body = match?.[2]
	if (extractor === undefined || body === undefined) throw new Error(`--extractor-args value must start with an extractor name: ${value}`)
	const values: Record<string, string[]> = {}
	for (const part of body.split(';')) {
		const separator = part.indexOf('=')
		const key = normalizeKey(separator === -1 ? part : part.slice(0, separator))
		if (key === '') continue
		const raw = separator === -1 ? '' : part.slice(separator + 1)
		values[key] = raw.split(/(?<!\\),/).map(item => item.replace(/\\,/g, ',').trim())
	}
	return {[extractor.toLowerCase()]: values}
}

/** Renders one extractor's arguments as a single `--extractor-args` value. */
export function renderExtractorArgsBlock(extractor: string, values: ExtractorArgValues): string {
	if (!KEY.test(extractor)) throw new Error(`Invalid extractor name for --extractor-args: ${extractor}`)
	const parts: string[] = []
	for (const [key, list] of Object.entries(values)) {
		if (!KEY.test(key)) throw new Error(`Invalid --extractor-args key: ${key}`)
		if (list.length === 0) continue
		for (const item of list) {
			// yt-dlp splits keys on ';' with no escape, so such a value cannot be passed at all.
			if (item.includes(';')) throw new Error(`--extractor-args value for ${extractor}:${key} cannot contain ';'`)
		}
		parts.push(`${key}=${list.map(item => item.replace(/,/g, '\\,')).join(',')}`)
	}
	return `${extractor.toLowerCase()}:${parts.join(';')}`
}

/** Merges extractor arguments key by key; a later layer's key replaces an earlier one's. */
export function mergeExtractorArgs(...layers: readonly ExtractorArgs[]): ExtractorArgs {
	const merged: Record<string, Record<string, readonly string[]>> = {}
	for (const layer of layers) {
		for (const [extractor, values] of Object.entries(layer)) {
			merged[extractor] = {...merged[extractor], ...values}
		}
	}
	return merged
}

interface ExtractorArgsOccurrence {
	index: number
	width: 1 | 2
	value: string
}

function occurrences(argv: readonly string[]): ExtractorArgsOccurrence[] {
	const found: ExtractorArgsOccurrence[] = []
	for (let index = 0; index < argv.length; index += 1) {
		const arg = argv[index] ?? ''
		const next = argv[index + 1]
		if (arg === EXTRACTOR_ARGS_FLAG && next !== undefined) {
			found.push({index, width: 2, value: next})
			index += 1
		} else if (arg.startsWith(`${EXTRACTOR_ARGS_FLAG}=`)) {
			found.push({index, width: 1, value: arg.slice(EXTRACTOR_ARGS_FLAG.length + 1)})
		}
	}
	return found
}

// The blocks yt-dlp would accept; one it rejects (no extractor name) carries nothing.
function acceptedBlocks(argv: readonly string[]): ExtractorArgs[] {
	return occurrences(argv).flatMap(({value}) => (EXTRACTOR_NAME.test(value) ? [parseExtractorArgsBlock(value)] : []))
}

/** The extractor arguments yt-dlp would act on for this argv: the last block per extractor wins whole. */
export function effectiveExtractorArgs(argv: readonly string[]): ExtractorArgs {
	const effective: Record<string, ExtractorArgValues> = {}
	for (const block of acceptedBlocks(argv)) Object.assign(effective, block)
	return effective
}

/** Extractors that this argv names in more than one block, where all but the last are silently lost. */
export function duplicateExtractorArgsBlocks(argv: readonly string[]): string[] {
	const seen = new Set<string>()
	const duplicates = new Set<string>()
	for (const block of acceptedBlocks(argv)) {
		for (const extractor of Object.keys(block)) {
			if (seen.has(extractor)) duplicates.add(extractor)
			seen.add(extractor)
		}
	}
	return [...duplicates]
}

/**
 * Folds every extractor-args block in `argv`, then `overrides`, into one block
 * per extractor, merged key by key, so everything a caller meant to pass
 * reaches yt-dlp. The blocks take the place of the first one in the argv, or
 * lead it when it had none.
 */
export function withExtractorArgs(argv: readonly string[], overrides: ExtractorArgs): string[] {
	const found = occurrences(argv)
	if (found.length === 0 && Object.keys(overrides).length === 0) return [...argv]
	const merged = mergeExtractorArgs(...found.map(({value}) => parseExtractorArgsBlock(value)), overrides)
	const rendered = Object.entries(merged).flatMap(([extractor, values]) => [EXTRACTOR_ARGS_FLAG, renderExtractorArgsBlock(extractor, values)])
	const skipped = new Set(found.flatMap(({index, width}) => (width === 2 ? [index, index + 1] : [index])))
	const rest = argv.filter((_, index) => !skipped.has(index))
	const at = found[0]?.index ?? 0
	return [...rest.slice(0, at), ...rendered, ...rest.slice(at)]
}
