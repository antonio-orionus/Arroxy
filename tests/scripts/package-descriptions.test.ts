// Package managers describe Arroxy from sources in this repo: package.json
// (Scoop, and the Linux desktop entry electron-builder writes), the Homebrew
// cask that publish-homebrew rewrites on every release, and the Flatpak
// metainfo and desktop entry. They say what the app does today, in one voice,
// without naming its engine or a count that goes stale.

import {readFileSync} from 'node:fs'
import yaml from 'js-yaml'
import {describe, expect, it} from 'vite-plus/test'

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function record(value: unknown, what: string): Record<string, unknown> {
	if (!isRecord(value)) throw new Error(`${what} is not a mapping`)
	return value
}

const pkg = record(JSON.parse(readFileSync('package.json', 'utf8')), 'package.json')
const release = record(yaml.load(readFileSync('.github/workflows/release.yml', 'utf8')), 'release.yml')
const jobs = record(release.jobs, 'jobs')
const metainfo = readFileSync('flatpak/io.github.antonio_orionus.Arroxy.metainfo.xml.in', 'utf8')
const desktop = readFileSync('flatpak/io.github.antonio_orionus.Arroxy.desktop', 'utf8')

function runs(jobName: string): string {
	const steps = record(jobs[jobName], jobName).steps
	if (!Array.isArray(steps)) throw new Error(`${jobName} has no steps`)
	return steps
		.filter(isRecord)
		.flatMap(step => (typeof step.run === 'string' ? [step.run] : []))
		.join('\n')
}

function caskDesc(): string {
	const match = /^\s*desc "([^"]*)"$/m.exec(runs('publish-homebrew'))
	if (!match?.[1]) throw new Error('publish-homebrew writes no desc')
	return match[1]
}

function englishSummary(): string {
	const match = /<summary>([^<]*)<\/summary>/.exec(metainfo)
	if (!match?.[1]) throw new Error('metainfo has no English summary')
	return match[1]
}

function desktopComment(): string {
	const match = /^Comment=(.*)$/m.exec(desktop)
	if (!match?.[1]) throw new Error('desktop entry has no Comment')
	return match[1]
}

const ENGINE = /yt-dlp|\bdlp\b/i
const LANGUAGE_COUNT = /\b\d+\s+languages\b/i

describe('package-manager descriptions', () => {
	it('package.json describes the app without naming its engine or counting languages', () => {
		expect(typeof pkg.description).toBe('string')
		expect(pkg.description).not.toMatch(ENGINE)
		expect(pkg.description).not.toMatch(LANGUAGE_COUNT)
		expect(pkg.description).not.toMatch(/^Arroxy\b/)
	})

	it('Scoop takes its description from the tagged package.json, like its license', () => {
		const script = runs('publish-scoop')
		expect(script).toMatch(/jq -r \.description/)
		expect(script).toMatch(/\.description = \$d/)
	})

	it('the Homebrew desc follows Homebrew style', () => {
		const desc = caskDesc()
		expect(desc.length).toBeLessThanOrEqual(80)
		expect(desc).not.toMatch(/^(Arroxy|A|An|The)\b/)
		expect(desc).not.toMatch(/\.$/)
		expect(desc).not.toMatch(ENGINE)
	})

	it('Homebrew, the Flatpak summary and the desktop entry share one short line', () => {
		expect(englishSummary()).toBe(caskDesc())
		expect(desktopComment()).toBe(caskDesc())
	})

	it('every summary and Comment translation is listed in both Flatpak files', () => {
		const summaryLangs = [...metainfo.matchAll(/<summary xml:lang="([^"]+)">/g)].map(m => m[1])
		const commentLangs = [...desktop.matchAll(/^Comment\[([^\]]+)\]=/gm)].map(m => m[1])
		expect(commentLangs).toEqual(summaryLangs)
	})

	it('the Flatpak files never name the engine or count languages', () => {
		for (const text of [metainfo, desktop]) {
			expect(text).not.toMatch(ENGINE)
			expect(text).not.toMatch(LANGUAGE_COUNT)
		}
	})
})
