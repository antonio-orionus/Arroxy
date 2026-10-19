import fs from 'node:fs'
import os from 'node:os'
import {loadConfig, type ServerConfig} from './config.js'
import {runCommand} from './runner.js'
import type {DetectedDependency} from './types.js'

export interface EnvironmentReport {
	platform: NodeJS.Platform
	arch: string
	node: {version: string; execPath: string}
	dependencies: DetectedDependency[]
	cookies: {fileConfigured: boolean; fileExists?: boolean; browserConfigured: boolean; browser?: string}
	policy: {outputRoot: string; tempRoot: string; allowArbitraryOutputPaths: boolean; allowConfigFiles: boolean; allowPluginDirs: boolean; enableExpertMode: boolean}
}

export async function checkEnvironment(config: ServerConfig = loadConfig()): Promise<EnvironmentReport> {
	const dependencies = await Promise.all([
		detectBinary('yt-dlp', config.ytdlpPath, ['--version'], ['all yt-dlp operations'], true, config),
		detectBinary('ffmpeg', config.ffmpegPath ?? 'ffmpeg', ['-version'], ['merge', 'remux', 'recode', 'extract audio', 'embed assets'], false, config),
		detectBinary('ffprobe', config.ffprobePath ?? 'ffprobe', ['-version'], ['audio extraction', 'media probing'], false, config),
		detectBinary('deno', 'deno', ['--version'], ['yt-dlp JavaScript challenges'], false, config),
		detectBinary('node', 'node', ['--version'], ['yt-dlp JavaScript challenges'], false, config),
		detectBinary('bun', 'bun', ['--version'], ['yt-dlp JavaScript challenges'], false, config),
		detectBinary('qjs', 'qjs', ['--version'], ['yt-dlp JavaScript challenges'], false, config),
		detectBinary('AtomicParsley', 'AtomicParsley', ['--version'], ['legacy thumbnail embedding'], false, config),
		detectBinary('aria2c', 'aria2c', ['--version'], ['external downloader'], false, config),
		detectBinary('curl', 'curl', ['--version'], ['external downloader'], false, config),
		detectBinary('wget', 'wget', ['--version'], ['external downloader'], false, config)
	])

	return {
		platform: process.platform,
		arch: os.arch(),
		node: {version: process.version, execPath: process.execPath},
		dependencies,
		cookies: cookieStatus(config),
		policy: {outputRoot: config.outputRoot, tempRoot: config.tempRoot, allowArbitraryOutputPaths: config.allowArbitraryOutputPaths, allowConfigFiles: config.allowConfigFiles, allowPluginDirs: config.allowPluginDirs, enableExpertMode: config.enableExpertMode}
	}
}

async function detectBinary(name: string, command: string, args: string[], requiredFor: string[], required: boolean, config: ServerConfig): Promise<DetectedDependency> {
	try {
		const result = await runCommand(command, args, {timeoutMs: Math.min(config.defaultTimeoutMs, 10_000), maxOutputBytes: 64 * 1024})
		return {name, status: 'available', command, version: firstLine(result.stdout || result.stderr), requiredFor, notes: required ? [] : ['Optional dependency; required only for matching workflows.']}
	} catch (error) {
		return {name, status: 'missing', command, requiredFor, notes: [required ? 'Required dependency is not available.' : 'Optional dependency is not available.', error instanceof Error ? error.message : String(error)]}
	}
}

function cookieStatus(config: ServerConfig): EnvironmentReport['cookies'] {
	const status: EnvironmentReport['cookies'] = {fileConfigured: Boolean(config.cookiesFile), browserConfigured: Boolean(config.cookiesFromBrowser)}
	if (config.cookiesFile) status.fileExists = fs.existsSync(config.cookiesFile)
	if (config.cookiesFromBrowser) {
		const browser = config.cookiesFromBrowser.split(':')[0]
		if (browser) status.browser = browser
	}
	return status
}

function firstLine(value: string): string {
	return (
		value
			.split(/\r?\n/)
			.map(line => line.trim())
			.find(Boolean) ?? ''
	)
}
