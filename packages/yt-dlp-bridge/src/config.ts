import os from 'node:os'
import path from 'node:path'

export interface ServerConfig {
	ytdlpPath: string
	ffmpegPath?: string | undefined
	ffprobePath?: string | undefined
	outputRoot: string
	tempRoot: string
	allowArbitraryOutputPaths: boolean
	allowConfigFiles: boolean
	allowPluginDirs: boolean
	enableExpertMode: boolean
	defaultTimeoutMs: number
	maxOutputBytes: number
	cookiesFile?: string | undefined
	cookiesFromBrowser?: string | undefined
	jsRuntimes: string[]
}

function bool(value: string | undefined): boolean {
	const normalized = blankToUndefined(value)
	return normalized ? ['1', 'true', 'yes', 'on'].includes(normalized.toLowerCase()) : false
}

function int(value: string | undefined, fallback: number): number {
	const normalized = blankToUndefined(value)
	const parsed = normalized ? Number.parseInt(normalized, 10) : Number.NaN
	return Number.isFinite(parsed) ? parsed : fallback
}

function blankToUndefined(value: string | undefined): string | undefined {
	const normalized = value?.trim()
	if (!normalized) return undefined
	return normalized
}

function firstNonBlank(...values: (string | undefined)[]): string | undefined {
	for (const value of values) {
		const normalized = blankToUndefined(value)
		if (normalized !== undefined) return normalized
	}
	return undefined
}

export function expandHome(input: string): string {
	if (input === '~') return os.homedir()
	if (input.startsWith('~/') || input.startsWith('~\\')) return path.join(os.homedir(), input.slice(2))
	return input
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServerConfig {
	return {
		ytdlpPath: firstNonBlank(env.YTDLP_MCP_YTDLP_PATH, env.YTDLP_PATH) ?? 'yt-dlp',
		ffmpegPath: firstNonBlank(env.YTDLP_MCP_FFMPEG_PATH, env.FFMPEG_PATH),
		ffprobePath: firstNonBlank(env.YTDLP_MCP_FFPROBE_PATH, env.FFPROBE_PATH),
		outputRoot: path.resolve(expandHome(firstNonBlank(env.YTDLP_MCP_OUTPUT_ROOT) ?? path.join(os.homedir(), 'Downloads', 'yt-dlp-mcp'))),
		tempRoot: path.resolve(expandHome(firstNonBlank(env.YTDLP_MCP_TEMP_ROOT) ?? path.join(os.tmpdir(), 'yt-dlp-mcp'))),
		allowArbitraryOutputPaths: bool(env.YTDLP_MCP_ALLOW_ARBITRARY_OUTPUT_PATHS),
		allowConfigFiles: bool(env.YTDLP_MCP_ALLOW_CONFIG_FILES),
		allowPluginDirs: bool(env.YTDLP_MCP_ALLOW_PLUGIN_DIRS),
		enableExpertMode: bool(env.YTDLP_MCP_ENABLE_EXPERT),
		defaultTimeoutMs: int(env.YTDLP_MCP_TIMEOUT_MS, 15 * 60 * 1000),
		maxOutputBytes: int(env.YTDLP_MCP_MAX_OUTPUT_BYTES, 4 * 1024 * 1024),
		cookiesFile: firstNonBlank(env.YTDLP_MCP_COOKIES_FILE),
		cookiesFromBrowser: firstNonBlank(env.YTDLP_MCP_COOKIES_FROM_BROWSER),
		jsRuntimes: (firstNonBlank(env.YTDLP_MCP_JS_RUNTIMES) ?? 'deno,node,bun,quickjs').split(',').flatMap(v => {
			const runtime = v.trim()
			return runtime ? [runtime] : []
		})
	}
}

export const CONFIG = loadConfig()
