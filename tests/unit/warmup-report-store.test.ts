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
		expect(store.read()).toEqual({attempt: 0, firstPending: false})
		store.write({attempt: 2, firstPending: true, undelivered: {hit: HIT, at: 1}})
		expect(store.read()).toEqual({attempt: 2, firstPending: true, undelivered: {hit: HIT, at: 1}})
	})

	it('reads a malformed value field by field, dropping only what is broken', () => {
		expect(parseWarmupReportState({attempt: -3, firstPending: 'yes', undelivered: {hit: {p: 1}, at: 'x'}})).toEqual({attempt: 0, firstPending: false})
		expect(parseWarmupReportState({attempt: 1, firstPending: true, undelivered: {hit: HIT, at: 5}})).toEqual({attempt: 1, firstPending: true, undelivered: {hit: HIT, at: 5}})
		expect(parseWarmupReportState('garbage')).toEqual({attempt: 0, firstPending: false})
	})
})
