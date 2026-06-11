import path from 'node:path'
import {describe, expect, it} from 'vitest'
import {denoManagedSourcePlans, denoTargetFor} from '@main/services/binary/DenoBinarySource.js'
import {ytDlpManagedSourcePlans} from '@main/services/binary/YtDlpBinarySource.js'

describe('managed binary source plans', () => {
	it('orders yt-dlp managed sources as nightly GitHub, stable GitHub, stable SourceForge', () => {
		const plans = ytDlpManagedSourcePlans('/cache', {platform: 'linux', arch: 'x64', sourceForgeVersion: '2026.06.09'})

		expect(plans.map(plan => plan.source)).toEqual([
			{kind: 'managed', channel: 'nightly', provider: 'github', url: 'https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp_linux'},
			{kind: 'managed', channel: 'stable', provider: 'github', url: 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux'},
			{kind: 'managed', channel: 'stable', provider: 'sourceforge', url: 'https://sourceforge.net/projects/yt-dlp.mirror/files/2026.06.09/yt-dlp_linux/download'}
		])
		expect(plans.map(plan => path.basename(plan.destinationPath))).toEqual(['yt-dlp', 'yt-dlp-stable', 'yt-dlp-stable'])
	})

	it('omits SourceForge yt-dlp when no SourceForge version is available', () => {
		const plans = ytDlpManagedSourcePlans('/cache', {platform: 'linux', arch: 'x64', sourceForgeVersion: null})

		expect(plans.map(plan => plan.source.provider)).toEqual(['github', 'github'])
	})

	it('orders Deno managed sources as dl.deno.land then GitHub with no bundled candidate', () => {
		const target = denoTargetFor('linux', 'x64')!
		const plans = denoManagedSourcePlans('/cache', target, {denoLandVersion: 'v2.8.2'})

		expect(plans.map(plan => plan.source)).toEqual([
			{kind: 'managed', channel: 'default', provider: 'deno-land', url: 'https://dl.deno.land/release/v2.8.2/deno-x86_64-unknown-linux-gnu.zip'},
			{kind: 'managed', channel: 'default', provider: 'github', url: 'https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip'}
		])
		expect(plans.every(plan => plan.installKind === 'archive')).toBe(true)
		expect(plans).not.toContainEqual(expect.objectContaining({source: expect.objectContaining({kind: 'bundled'})}))
		expect(plans.map(plan => path.basename(plan.destinationPath))).toEqual(['deno', 'deno'])
	})

	it('falls back to GitHub Deno when dl.deno.land latest version is unavailable', () => {
		const target = denoTargetFor('linux', 'x64')!
		const plans = denoManagedSourcePlans('/cache', target, {denoLandVersion: null})

		expect(plans.map(plan => plan.source.provider)).toEqual(['github'])
	})
})
