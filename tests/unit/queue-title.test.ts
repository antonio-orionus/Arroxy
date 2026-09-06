// @vitest-environment node

import {describe, expect, it} from 'vitest'
import {DEFAULT_FILENAME_TEMPLATE} from '@shared/filenameTemplate.js'
import {deriveTitleFromArtifact, withBackfilledTitle} from '@shared/queueTitle.js'
import {makeItem} from '../shared/fixtures.js'

describe('deriveTitleFromArtifact', () => {
	it('derives from the default `{title} [{id}]` template by stripping the trailing id group and extension', () => {
		expect(deriveTitleFromArtifact('Real Title [abc123].mp4', DEFAULT_FILENAME_TEMPLATE)).toBe('Real Title')
	})

	it('keeps earlier bracket groups that belong to the title itself', () => {
		expect(deriveTitleFromArtifact('A [B] C [abc123].mkv', DEFAULT_FILENAME_TEMPLATE)).toBe('A [B] C')
	})

	it('derives from the exact `{title}` template by stripping only the extension', () => {
		expect(deriveTitleFromArtifact('Real Title.mp4', '{title}')).toBe('Real Title')
	})

	it('accepts the bound-id variant the binder produces for known video ids', () => {
		expect(deriveTitleFromArtifact('Real Title [abc123].mp4', '{title} [abc123]')).toBe('Real Title')
	})

	it('rejects a custom template shape', () => {
		expect(deriveTitleFromArtifact('Uploader - Real Title.mp4', '{uploader} - {title}')).toBeNull()
	})

	it('rejects a custom template that moves the id out of brackets', () => {
		expect(deriveTitleFromArtifact('Real Title - abc123.mp4', '{title} - {id}')).toBeNull()
	})

	it('rejects a template with surviving tokens in the suffix', () => {
		expect(deriveTitleFromArtifact('Real Title [1080p].mp4', '{title} [{resolution}]')).toBeNull()
	})

	it('rejects a missing artifact filename', () => {
		expect(deriveTitleFromArtifact('', DEFAULT_FILENAME_TEMPLATE)).toBeNull()
	})

	it('rejects a missing filename template', () => {
		expect(deriveTitleFromArtifact('Real Title [abc123].mp4', undefined)).toBeNull()
	})

	it('never guesses when the default template produced no id suffix', () => {
		expect(deriveTitleFromArtifact('Real Title.mp4', DEFAULT_FILENAME_TEMPLATE)).toBeNull()
	})

	it('rejects an empty derived title', () => {
		expect(deriveTitleFromArtifact(' [abc123].mp4', DEFAULT_FILENAME_TEMPLATE)).toBeNull()
		expect(deriveTitleFromArtifact('.mp4', '{title}')).toBeNull()
	})
})

describe('withBackfilledTitle', () => {
	it('sets the title and drops the placeholder flag so layers never fight', () => {
		const item = makeItem({id: 'placeholder', status: 'pending', title: 'Untitled · #1', titleIsPlaceholder: true})

		const next = withBackfilledTitle(item, 'Real Title')

		expect(next.title).toBe('Real Title')
		expect(next.titleIsPlaceholder).toBeUndefined()
		expect(next).toMatchObject({id: 'placeholder', status: 'pending', url: item.url})
	})
})
