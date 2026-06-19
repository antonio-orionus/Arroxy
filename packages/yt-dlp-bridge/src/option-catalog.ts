import catalog from './generated/ytdlp-options.json' with {type: 'json'}
import {z} from 'zod'
import type {OptionPolicy, OptionRisk, OptionRiskPhase} from './schemas.js'

const UpstreamOptionDescriptorSchema = z.object({
	group: z.string(),
	shortOptions: z.array(z.string()),
	longOptions: z.array(z.string()),
	dest: z.string().nullable(),
	action: z.string().nullable(),
	type: z.string().nullable(),
	metavar: z.string().nullable(),
	default: z.unknown(),
	choices: z.array(z.string()),
	takesValue: z.boolean(),
	help: z.string()
})

const UpstreamOptionCatalogSchema = z.object({source: z.string(), ytDlpVersion: z.string(), optionCount: z.number().int().nonnegative(), groups: z.array(z.object({title: z.string(), optionCount: z.number().int().nonnegative()})), options: z.array(UpstreamOptionDescriptorSchema)})

export interface UpstreamOptionDescriptor {
	group: string
	shortOptions: string[]
	longOptions: string[]
	dest: string | null
	action: string | null
	type: string | null
	metavar: string | null
	default: unknown
	choices: string[]
	takesValue: boolean
	help: string
}

export interface UpstreamOptionCatalog {
	source: string
	ytDlpVersion: string
	optionCount: number
	groups: {title: string; optionCount: number}[]
	options: UpstreamOptionDescriptor[]
}

export interface OptionRiskMetadata {
	phase: OptionRiskPhase
	dependencies: string[]
	risk: OptionRisk
	policy: OptionPolicy
}

export const UPSTREAM_OPTION_CATALOG: UpstreamOptionCatalog = UpstreamOptionCatalogSchema.parse(catalog)

const HIGH_RISK_FLAGS = new Set(['--exec', '--downloader-args', '--postprocessor-args', '--use-postprocessor', '--config-locations', '--plugin-dirs', '--enable-file-urls', '--netrc-cmd', '--print-traffic', '--dump-pages', '--write-pages', '--force-overwrites', '--rm-cache-dir'])

const BLOCKED_FLAGS = new Set(['-U', '--update', '--update-to'])
const PATH_GATED_FLAGS = new Set(['--paths', '-P', '--output', '-o', '--batch-file', '-a', '--download-archive', '--cookies', '--netrc-location', '--cache-dir', '--load-info-json', '--ffmpeg-location', '--client-certificate', '--client-certificate-key'])

export function findOptionByFlag(flag: string): UpstreamOptionDescriptor | undefined {
	return UPSTREAM_OPTION_CATALOG.options.find(option => option.shortOptions.includes(flag) || option.longOptions.includes(flag))
}

export function listLongFlags(): string[] {
	return UPSTREAM_OPTION_CATALOG.options.flatMap(option => option.longOptions).sort()
}

export function optionMetadata(option: UpstreamOptionDescriptor): OptionRiskMetadata {
	const flags = [...option.shortOptions, ...option.longOptions]
	const blocked = flags.some(flag => BLOCKED_FLAGS.has(flag))
	const highRisk = flags.some(flag => HIGH_RISK_FLAGS.has(flag))
	const pathGated = flags.some(flag => PATH_GATED_FLAGS.has(flag))
	return {phase: phaseForGroup(option.group), dependencies: dependenciesForFlags(flags), risk: highRisk || blocked ? 'high' : pathGated ? 'medium' : 'low', policy: blocked ? 'blocked-in-expert' : highRisk ? 'expert-only' : pathGated ? 'path-gated' : 'safe'}
}

function phaseForGroup(group: string): OptionRiskMetadata['phase'] {
	if (group === 'Post-Processing Options' || group === 'SponsorBlock Options') return 'postprocess'
	if (group === 'Download Options' || group === 'Filesystem Options' || group === 'Authentication Options') return 'download'
	if (group === 'Verbosity and Simulation Options' || group === 'Thumbnail Options' || group === 'Subtitle Options' || group === 'Video Format Options') return 'inspect'
	if (group === 'General Options' || /config|plugin/i.test(group)) return 'expert'
	return 'plan'
}

function dependenciesForFlags(flags: string[]): string[] {
	const deps = new Set<string>()
	const audioDependencyFlags = new Set(['--extract-audio', '--audio-format', '--audio-quality'])
	const ffmpegDependencyFlags = new Set([
		'--remux-video',
		'--recode-video',
		'--embed-subs',
		'--embed-thumbnail',
		'--embed-metadata',
		'--embed-chapters',
		'--embed-info-json',
		'--concat-playlist',
		'--fixup',
		'--ffmpeg-location',
		'--convert-subs',
		'--convert-thumbnails',
		'--split-chapters',
		'--remove-chapters',
		'--force-keyframes-at-cuts',
		'--sponsorblock-remove',
		'--merge-output-format',
		'--download-sections'
	])
	for (const flag of flags) {
		if (audioDependencyFlags.has(flag)) {
			deps.add('ffmpeg')
			deps.add('ffprobe')
		}
		if (ffmpegDependencyFlags.has(flag)) {
			deps.add('ffmpeg')
		}
		if (flag === '--js-runtimes') deps.add('deno|node|bun|quickjs')
		if (flag === '--impersonate') deps.add('curl_cffi')
		if (flag === '--downloader') deps.add('external-downloader')
		if (flag === '--cookies-from-browser') deps.add('browser')
	}
	return [...deps]
}
