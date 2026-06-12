import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

import {btbnTargets} from '../../scripts/build/btbnResolver.js'
import {YT_DLP_SOURCES, ytDlpTargets} from '@main/services/binary/YtDlpBinarySource.js'

const root = process.cwd()
const ytDlpTargetMatrix = [
	{platform: 'win32', arch: 'x64'},
	{platform: 'win32', arch: 'arm64'},
	{platform: 'darwin', arch: 'x64'},
	{platform: 'darwin', arch: 'arm64'},
	{platform: 'linux', arch: 'x64'},
	{platform: 'linux', arch: 'arm64'}
] as const

function read(path: string): string {
	return readFileSync(join(root, path), 'utf8')
}

function expectedPayloadCountFromSources(): number {
	const ytDlpAssets = new Set<string>()
	for (const target of ytDlpTargetMatrix) {
		const match = ytDlpTargets().find(candidate => candidate.platform === target.platform && candidate.arch === target.arch)
		if (match) ytDlpAssets.add(match.assetName)
	}

	return ytDlpAssets.size * 3 + btbnTargets().length + 4
}

describe('binary source smoke script', () => {
	it('covers every configured managed binary URL provider', () => {
		const script = read('scripts/test-binaries/smoke-all.sh')

		expect(script).toContain('https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download')
		expect(script).toContain('https://github.com/yt-dlp/yt-dlp/releases/latest/download')
		expect(script).toContain(YT_DLP_SOURCES.stableSourceForge.rss)
		expect(script).toContain(YT_DLP_SOURCES.stableSourceForge.files)
	})

	it('keeps BtbN live smoke resilient without changing production resolver policy', () => {
		const script = read('scripts/test-binaries/smoke-all.sh')

		expect(script).toContain('resolve_btbn_with_retry')
		expect(script).toContain('BTBN_RELEASE_TAG=latest')
		expect(script).toContain('BtbN recent-release API unavailable')
	})

	it('reports a real payload count derived from the current target/source matrix', () => {
		const output = execFileSync('bash', ['scripts/test-binaries/smoke-all.sh', '--expected-payloads'], {cwd: root, encoding: 'utf8'}).trim()

		expect(Number(output)).toBe(expectedPayloadCountFromSources())
	})
})
