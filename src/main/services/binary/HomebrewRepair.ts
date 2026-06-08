import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import log from 'electron-log/main.js'
import {firstExecutable, whereOnPath} from './BinaryProbe.js'

const execFileAsync = promisify(execFile)
const logger = log.scope('homebrew-repair')
const HOMEBREW_INSTALL_TIMEOUT_MS = 10 * 60 * 1000

export async function installYtDlpWithHomebrew(): Promise<string> {
	if (process.platform !== 'darwin') {
		throw new Error('Homebrew repair is only available on macOS.')
	}

	const brewPath = await firstExecutable(await whereOnPath('brew'))
	if (!brewPath) {
		throw new Error('Homebrew was not found. Install Homebrew first, then retry setup.')
	}

	logger.info('Installing yt-dlp with Homebrew', {brewPath})
	await execFileAsync(brewPath, ['install', 'yt-dlp'], {timeout: HOMEBREW_INSTALL_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, env: {...process.env, NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1'}})

	const installed = await firstExecutable(await whereOnPath('yt-dlp'))
	if (installed) return installed

	throw new Error('Homebrew finished, but yt-dlp was not found in Homebrew bin paths.')
}
