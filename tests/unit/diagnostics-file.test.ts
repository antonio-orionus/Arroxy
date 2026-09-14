import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {writeDiagnosticsFile} from '@main/services/DiagnosticsFile.js'

// A user filing a bug should not have to find two log files and describe their
// setup by hand: one file, everything a maintainer needs, safe to post publicly.
describe('writeDiagnosticsFile', () => {
	let root: string
	let logDir: string
	let outputDir: string

	beforeEach(async () => {
		root = await fs.mkdtemp(path.join(os.tmpdir(), 'arroxy-diagnostics-'))
		logDir = path.join(root, 'logs')
		outputDir = path.join(root, 'Downloads')
		await fs.mkdir(logDir)
		await fs.mkdir(outputDir)
	})

	afterEach(async () => {
		await fs.rm(root, {recursive: true, force: true})
	})

	const now = new Date('2026-09-14T10:20:30.000Z')
	const context = {appVersion: '0.4.14', proxy: 'http://***:***@127.0.0.1:10808'}

	it('combines the context with the rotated and current log, oldest first', async () => {
		await fs.writeFile(path.join(logDir, 'main.old.log'), 'old line from /Users/alice/Downloads\n')
		await fs.writeFile(path.join(logDir, 'main.log'), 'new line C:\\Users\\Alice Smith\\Downloads\n')

		const filePath = await writeDiagnosticsFile({logPath: path.join(logDir, 'main.log'), outputDir, context, now})
		const content = await fs.readFile(filePath, 'utf8')

		expect(filePath).toBe(path.join(outputDir, 'arroxy-diagnostics-20260914-102030.txt'))
		expect(content).toContain('"appVersion": "0.4.14"')
		expect(content.indexOf('== main.old.log ==')).toBeLessThan(content.indexOf('== main.log =='))
		expect(content).toContain('old line from /Users/<user>/Downloads')
		expect(content).toContain('new line C:\\Users\\<user>\\Downloads')
		expect(content).not.toContain('alice')
		expect(content).not.toContain('Alice Smith')
	})

	it('says so when there is no rotated log yet', async () => {
		await fs.writeFile(path.join(logDir, 'main.log'), 'only line\n')

		const content = await fs.readFile(await writeDiagnosticsFile({logPath: path.join(logDir, 'main.log'), outputDir, context, now}), 'utf8')

		expect(content).toContain('== main.old.log ==\n(not present)')
		expect(content).toContain('only line')
	})
})
