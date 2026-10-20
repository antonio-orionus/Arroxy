import {execFile} from 'node:child_process'
import path from 'node:path'
import {promisify} from 'node:util'
import log from 'electron-log/main.js'
import SemVer from 'semver/classes/semver.js'
import coerce from 'semver/functions/coerce.js'
import {HOMEBREW_CASK} from '@shared/constants.js'
import {firstExecutable, whereOnPath} from './BinaryProbe.js'
import {ffmpegPairOnPath, type FfmpegPairPaths} from './ffmpegPairOnPath.js'

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

async function runBrew(args: string[], notFoundHint: string, extraEnv: Record<string, string> = {}): Promise<string> {
	if (process.platform !== 'darwin') {
		throw new Error('Homebrew repair is only available on macOS.')
	}

	const brewPath = await findHomebrew()
	if (!brewPath) {
		throw new Error(`Homebrew was not found. ${notFoundHint}`)
	}

	logger.info('Running Homebrew', {brewPath, args})
	const {stdout} = await execFileAsync(brewPath, args, {timeout: HOMEBREW_INSTALL_TIMEOUT_MS, maxBuffer: 4 * 1024 * 1024, env: {...process.env, NONINTERACTIVE: '1', HOMEBREW_NO_ANALYTICS: '1', ...extraEnv}})
	return stdout
}

const ARROXY_COMMAND_HINT = 'Run the command shown in the banner in a terminal instead.'

// Homebrew refreshes its taps at most once per 24 h before an install or
// upgrade. Right after a release that throttle leaves the tap on the old cask,
// and `brew upgrade` exits 0 with "latest version is already installed", so ask
// for a refresh every time.
const FRESH_TAP_ENV = {HOMEBREW_AUTO_UPDATE_SECS: '0'}

// Cask versions may have two or four parts. coerce maps them onto semver (a
// fourth part is dropped), and an unreadable one counts as 0.0.0.
function caskVersion(version: string): SemVer {
	return coerce(version) ?? new SemVer('0.0.0')
}

// `brew list --cask --versions arroxy` prints "arroxy 0.5.3", or several
// versions after the name while an old one lingers. The newest counts.
function newestInstalled(listOutput: string): string | null {
	const versions = listOutput
		.trim()
		.split(/\s+/)
		.slice(1)
		.filter(token => /^\d+(\.\d+)*$/.test(token))
	return versions.reduce<string | null>((newest, version) => (newest === null || caskVersion(version).compare(caskVersion(newest)) > 0 ? version : newest), null)
}

// A zero exit is not proof of an update: a stale tap or an already-current cask
// also succeeds. Only a cask at or past the announced version may be relaunched into.
async function runArroxyBrew(args: string[], expectedVersion: string): Promise<void> {
	await runBrew(args, ARROXY_COMMAND_HINT, FRESH_TAP_ENV)
	const installed = newestInstalled(await runBrew(['list', '--cask', '--versions', 'arroxy'], ARROXY_COMMAND_HINT))
	if (installed === null) {
		throw new Error(`Homebrew did not report an installed Arroxy version, so ${expectedVersion} could not be confirmed. Try again, or run the command shown in the banner in a terminal.`)
	}
	if (caskVersion(installed).compare(caskVersion(expectedVersion)) < 0) {
		throw new Error(`Homebrew has Arroxy ${installed} but ${expectedVersion} was announced. Its repository may be a few minutes behind the release: try again shortly, or download the DMG.`)
	}
}

// Fixed argv, no caller-supplied input: the in-app "Run" for the Homebrew
// update banner shows the same command it copies. Homebrew refuses a cask from
// an untrusted tap by its short name; the fully qualified name trusts it first,
// so a cask installed before Homebrew required tap trust still upgrades.
export async function upgradeArroxyWithHomebrew(expectedVersion: string): Promise<void> {
	await runArroxyBrew(['upgrade', '--cask', HOMEBREW_CASK], expectedVersion)
}

// Moves a DMG-installed copy under Homebrew while updating it. `--adopt` cannot
// do this: it requires the installed app to be identical to the cask's, and an
// update is by definition pending. `--force` overwrites the old bundle and
// registers the cask, so later updates run through `upgradeArroxyWithHomebrew`.
export async function installArroxyWithHomebrew(expectedVersion: string): Promise<void> {
	await runArroxyBrew(['install', '--cask', '--force', HOMEBREW_CASK], expectedVersion)
}

export async function installYtDlpWithHomebrew(): Promise<string> {
	await runBrew(['install', 'yt-dlp'], 'Install Homebrew first, then retry setup.')

	const installed = await firstExecutable(await whereOnPath('yt-dlp'))
	if (installed) return installed

	throw new Error('Homebrew finished, but yt-dlp was not found in Homebrew bin paths.')
}

export async function installFfmpegWithHomebrew(): Promise<FfmpegPairPaths> {
	await runBrew(['install', 'ffmpeg'], 'Install Homebrew first, then retry setup.')
	// brew links installed formulae into the bin folder brew itself lives in.
	const brewPath = await findHomebrew()
	return ffmpegPairOnPath('Homebrew', {preferred: brewPath ? [path.dirname(brewPath)] : []})
}
