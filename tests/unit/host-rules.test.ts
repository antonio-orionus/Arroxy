import {describe, expect, it} from 'vite-plus/test'
import {hostMatches} from '@shared/sites/hostRules.js'
import {youtubeSite} from '@shared/sites/youtube.js'
import type {HostRule} from '@shared/sites/types.js'

describe('hostMatches', () => {
	it('exact rules match only that host', () => {
		const rules: HostRule[] = [{kind: 'exact', host: 'youtu.be'}]
		expect(hostMatches('youtu.be', rules)).toBe(true)
		expect(hostMatches('www.youtu.be', rules)).toBe(false)
		expect(hostMatches('evilyoutu.be', rules)).toBe(false)
	})

	it('suffix rules match the domain and its subdomains, never a lookalike', () => {
		const rules: HostRule[] = [{kind: 'suffix', domain: 'youtube.com'}]
		for (const host of ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'a.b.youtube.com']) expect(hostMatches(host, rules)).toBe(true)
		for (const host of ['notyoutube.com', 'youtube.com.evil.example', 'evil.example/youtube.com', 'youtube.co', 'com']) expect(hostMatches(host, rules)).toBe(false)
	})

	it('compares case-insensitively and ignores one trailing dot', () => {
		const rules: HostRule[] = [
			{kind: 'suffix', domain: 'youtube.com'},
			{kind: 'exact', host: 'youtu.be'}
		]
		expect(hostMatches('WWW.YouTube.COM', rules)).toBe(true)
		expect(hostMatches('www.youtube.com.', rules)).toBe(true)
		expect(hostMatches('YOUTU.BE.', rules)).toBe(true)
		expect(hostMatches('www.youtube.com..', rules)).toBe(false)
	})

	it('rejects an empty host and an empty rule list', () => {
		expect(hostMatches('', [{kind: 'exact', host: 'youtu.be'}])).toBe(false)
		expect(hostMatches('.', [{kind: 'suffix', domain: 'youtube.com'}])).toBe(false)
		expect(hostMatches('youtube.com', [])).toBe(false)
	})

	describe('google-accounts-cctld', () => {
		const rules: HostRule[] = [{kind: 'pattern', pattern: 'google-accounts-cctld'}]
		it.each(['accounts.google.de', 'accounts.google.fr', 'accounts.google.co.in', 'accounts.google.co.uk', 'accounts.google.com.br', 'accounts.google.com.au', 'ACCOUNTS.GOOGLE.DE', 'accounts.google.de.'])('matches %s', host => expect(hostMatches(host, rules)).toBe(true))
		// Country codes only: a 3-letter generic TLD is not one of Google's country sign-in hosts.
		it.each(['accounts.google.xyz', 'accounts.google.biz', 'accounts.google.net', 'accounts.google.org', 'accounts.google.com', 'accounts.google.co.xyz', 'accounts.google.com.net'])('does not match the generic TLD %s', host => expect(hostMatches(host, rules)).toBe(false))
		it.each([
			'accounts.google',
			'accounts.google.d',
			'accounts.google.dede',
			'accounts.google.co.i',
			'accounts.google.co.indi',
			'accounts.google.com.b',
			'accounts.google.de.evil.example',
			'evil.accounts.google.de',
			'accounts.google.com.evil',
			'accounts.google.co.in.evil.example',
			'accounts.google.c0',
			'accounts.google.x.de',
			'accounts.googleX.de',
			'myaccounts.google.de',
			'google.de',
			'www.google.de'
		])('does not match %s', host => expect(hostMatches(host, rules)).toBe(false))
	})
})

describe('youtube navigationHosts', () => {
	const rules = youtubeSite.explore?.navigationHosts ?? []
	it('is declared', () => expect(rules.length).toBeGreaterThan(0))
	it.each(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'accounts.google.com', 'accounts.youtube.com', 'accounts.google.de', 'accounts.google.co.in', 'accounts.google.com.br', 'consent.youtube.com', 'consent.google.com'])('allows %s', host =>
		expect(hostMatches(host, rules)).toBe(true)
	)
	it.each(['example.com', 'google.com', 'www.google.com', 'mail.google.com', 'myaccount.google.com', 'consent.example.com', 'youtube.com.evil.example', 'notyoutube.com', 'www.youtu.be', 'accounts.google.com.evil.example', 'play.google.com', 'accounts.google.xyz', 'accounts.google.net'])('refuses %s', host =>
		expect(hostMatches(host, rules)).toBe(false)
	)
})
