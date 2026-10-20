import path from 'node:path'
import {describe, expect, it} from 'vite-plus/test'
import {applyUserDataOverride} from '@main/userDataOverride.js'
import {mainLogPath} from '@main/utils/logFile.js'

function makePaths(initial: string) {
	let userData = initial
	return {
		getPath: (_name: 'userData') => userData,
		setPath: (_name: 'userData', value: string) => {
			userData = value
		}
	}
}

describe('applyUserDataOverride', () => {
	it('moves the profile to ELECTRON_USER_DATA and returns that path', () => {
		const paths = makePaths('/real/profile')

		expect(applyUserDataOverride(paths, {ELECTRON_USER_DATA: '/scratch/profile'})).toBe('/scratch/profile')
		expect(paths.getPath('userData')).toBe('/scratch/profile')
	})

	it('keeps the default profile when ELECTRON_USER_DATA is unset or empty', () => {
		const paths = makePaths('/real/profile')

		expect(applyUserDataOverride(paths, {})).toBe('/real/profile')
		expect(applyUserDataOverride(paths, {ELECTRON_USER_DATA: ''})).toBe('/real/profile')
	})
})

describe('mainLogPath', () => {
	it('puts main.log under the profile logs directory', () => {
		expect(mainLogPath('/scratch/profile')).toBe(path.join('/scratch/profile', 'logs', 'main.log'))
	})
})
