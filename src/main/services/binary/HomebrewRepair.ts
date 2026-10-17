import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import log from 'electron-log/main.js'
import {HOMEBREW_CASK} from '@shared/constants.js'
import {firstExecutable, whereOnPath} from './BinaryProbe.js'

const execFileAsync = promisify(execFile)
const logger = log.scope('homebrew-repair')
const HOMEBREW_INSTALL_TIMEOUT_MS = 10 * 60 * 1000

// The brew executable on this Mac, or null: not installed, or not macOS.
async function findHomebrew(): Promise<string | null> {
	if (process.platform !== 'darwin') return null
	return firstExecutable(await whereOnPath('brew'))
}

// Homebrew installs the cask under /Applications. A copy running from elsewhere
// (Downloads, ~/Applications) would be left behind, and a relaunch would reopen
// that stale copy, so the switch is offered only to /Applications installs.
export async function canMoveUnderHomebrew(execPath: string = process.execPath): Promise<boolean> {
	if (process.platform !== 'darwin' || !execPath.startsWith('/Applications/')) return false
	return (await findHomebrew()) !== null
}

async function runBrew(args: string[], notFoundHint: string): Promise<void> {
	if (process.platform !== 'darwin') {
		throw new Error('Homebrew repair is only available on macOS.')
	}

	const brewPath = await findHomebrew()
	if (!brewPath) {
		throw new Error(`Homebrew was not found. ${notFoundHint}`)
	}

	logger.info('Running Homebrew', {brewPath, args})
	await execFileAsync(brewPath, args, {timeout: HOMEBREW_INSTALL_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, env: {...process.env, NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1'}})
}

// Fixed argv, no caller-supplied input: the in-app "Run" for the Homebrew
// update banner shows the same command it copies.
export async function upgradeArroxyWithHomebrew(): Promise<void> {
	await runBrew(['upgrade', '--cask', 'arroxy'], 'Run the command shown in the banner in a terminal instead.')
}

// Moves a DMG-installed copy under Homebrew while updating it. `--adopt` cannot
// do this: it requires the installed app to be identical to the cask's, and an
// update is by definition pending. `--force` overwrites the old bundle and
// registers the cask, so later updates run through `upgradeArroxyWithHomebrew`.
export async function installArroxyWithHomebrew(): Promise<void> {
	await runBrew(['install', '--cask', '--force', HOMEBREW_CASK], 'Run the command shown in the banner in a terminal instead.')
}

export async function installYtDlpWithHomebrew(): Promise<string> {
	await runBrew(['install', 'yt-dlp'], 'Install Homebrew first, then retry setup.')

	const installed = await firstExecutable(await whereOnPath('yt-dlp'))
	if (installed) return installed

	throw new Error('Homebrew finished, but yt-dlp was not found in Homebrew bin paths.')
}
