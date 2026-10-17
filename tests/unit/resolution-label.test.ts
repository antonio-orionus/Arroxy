import {describe, expect, it} from 'vite-plus/test'
import {resolutionLabel} from '@renderer/lib/resolutionLabel.js'

describe('resolutionLabel', () => {
	it('names a standard landscape size by its height, with a short alias for the tiers that have one', () => {
		expect(resolutionLabel('7680x4320')).toEqual({label: '4320p', alias: '8K'})
		expect(resolutionLabel('3840x2160')).toEqual({label: '2160p', alias: '4K'})
		expect(resolutionLabel('2560x1440')).toEqual({label: '1440p', alias: '2K'})
	})

	it('gives the tiers below 2K a label and no alias', () => {
		expect(resolutionLabel('1920x1080')).toEqual({label: '1080p', alias: null})
		expect(resolutionLabel('1280x720')).toEqual({label: '720p', alias: null})
		expect(resolutionLabel('854x480')).toEqual({label: '480p', alias: null})
		expect(resolutionLabel('640x360')).toEqual({label: '360p', alias: null})
		expect(resolutionLabel('426x240')).toEqual({label: '240p', alias: null})
		expect(resolutionLabel('256x144')).toEqual({label: '144p', alias: null})
	})

	it('reads the tier from the long side, so a portrait or cropped video keeps its landscape twin name', () => {
		expect(resolutionLabel('1080x1920')).toEqual({label: '1080p', alias: null})
		expect(resolutionLabel('720x1280')).toEqual({label: '720p', alias: null})
		expect(resolutionLabel('1920x818')).toEqual({label: '1080p', alias: null})
		expect(resolutionLabel('2160x3840')).toEqual({label: '2160p', alias: '4K'})
	})

	it('rounds an odd size down to the tier it reaches, allowing a few pixels short of one', () => {
		expect(resolutionLabel('1000x562')).toEqual({label: '480p', alias: null})
		expect(resolutionLabel('1912x1076')).toEqual({label: '1080p', alias: null})
		expect(resolutionLabel('3344x2160')).toEqual({label: '2160p', alias: '4K'})
	})

	it('keeps a size below the smallest tier as the probe reported it', () => {
		expect(resolutionLabel('160x90')).toEqual({label: '160x90', alias: null})
	})

	it('passes through text that is not a width-by-height size', () => {
		expect(resolutionLabel('1080p')).toEqual({label: '1080p', alias: null})
		expect(resolutionLabel('audio only')).toEqual({label: 'audio only', alias: null})
		expect(resolutionLabel('')).toEqual({label: '', alias: null})
	})
})
