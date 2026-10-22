// @vitest-environment node
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {parseWarmupReportState, WarmupReportStore} from '@main/stores/WarmupReportStore.js'

const HIT = {sid: 'arroxy-warmup', h: 'https://desktop.arroxy', p: '/0.7.4/first/a1/ok', r: '10-30s', us: 'zh-CN', um: 'win32-x64', uc: 'remote', ut: 'none', uco: '2-10mbps', ht: '1'}

describe('WarmupReportStore', () => {
	it('starts empty and round-trips its state', async () => {
		const store = new WarmupReportStore(await fs.mkdtemp(path.join(os.tmpdir(), 'warmup-report-')))
		expect(store.read()).toEqual({attempt: 0, firstPending: false, kept: []})
		store.write({attempt: 2, firstPending: true, kept: [{hit: HIT, at: 1}]})
		expect(store.read()).toEqual({attempt: 2, firstPending: true, kept: [{hit: HIT, at: 1}]})
	})

	it('reads a malformed value field by field, dropping only what is broken', () => {
		expect(
			parseWarmupReportState({
				attempt: -3,
				firstPending: 'yes',
				kept: [
					{hit: {p: 1}, at: 'x'},
					{hit: HIT, at: 5}
				]
			})
		).toEqual({attempt: 0, firstPending: false, kept: [{hit: HIT, at: 5}]})
		expect(parseWarmupReportState({attempt: 1, firstPending: true, kept: 'nope'})).toEqual({attempt: 1, firstPending: true, kept: []})
		expect(parseWarmupReportState('garbage')).toEqual({attempt: 0, firstPending: false, kept: []})
	})

	it('keeps only the newest reports', () => {
		const kept = Array.from({length: 6}, (_, at) => ({hit: HIT, at}))
		expect(parseWarmupReportState({attempt: 0, firstPending: false, kept}).kept.map(entry => entry.at)).toEqual([2, 3, 4, 5])
	})
})
