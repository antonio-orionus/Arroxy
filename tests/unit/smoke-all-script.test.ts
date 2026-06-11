import {readFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
import {join} from 'node:path'
import {describe, expect, it} from 'vitest'

import {btbnTargets} from '../../scripts/build/btbnResolver.js'
import {DENO_SOURCES, denoTargets} from '@main/services/binary/DenoBinarySource.js'
import {YT_DLP_SOURCES, ytDlpManagedSourcePlans} from '@main/services/binary/YtDlpBinarySource.js'

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
	const ytDlpUrls = new Set<string>()
	for (const target of ytDlpTargetMatrix) {
		for (const plan of ytDlpManagedSourcePlans('/tmp/arroxy-smoke', {...target, sourceForgeVersion: '2099.01.02'})) {
			ytDlpUrls.add(plan.downloadUrl)
		}
	}

	return ytDlpUrls.size + btbnTargets().length + 4 + denoTargets().length * 2
}

describe('binary source smoke script', () => {
	it('covers every configured managed binary URL provider', () => {
		const script = read('scripts/test-binaries/smoke-all.sh')
		const denoResolver = read('scripts/build/denoResolver.ts')

		expect(script).toContain(YT_DLP_SOURCES.nightlyGithub.download)
		expect(script).toContain(YT_DLP_SOURCES.stableGithub.download)
		expect(script).toContain(YT_DLP_SOURCES.stableSourceForge.rss)
		expect(script).toContain(YT_DLP_SOURCES.stableSourceForge.files)
		expect(denoResolver).toContain(DENO_SOURCES.denoLand.latest)
		expect(denoResolver).toContain(DENO_SOURCES.denoLand.release)
		expect(script).toContain(DENO_SOURCES.denoGithub.download)
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
		expect(Number(output)).toBe(30)
	})
})
