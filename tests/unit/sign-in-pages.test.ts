import {describe, expect, it} from 'vite-plus/test'
import {EXPLORE_SIGN_IN_PAGES, isSignInPage} from '@shared/sites/signInPages.js'
import type {SignInPage} from '@shared/sites/types.js'

const page = (raw: string, pages: readonly SignInPage[] = EXPLORE_SIGN_IN_PAGES) => isSignInPage(new URL(raw), pages)

describe('isSignInPage', () => {
	it('a whole-host page matches every path on that host', () => {
		const pages: SignInPage[] = [{host: {kind: 'exact', host: 'accounts.example'}}]
		expect(page('https://accounts.example/', pages)).toBe(true)
		expect(page('https://accounts.example/any/path?q=1', pages)).toBe(true)
		expect(page('https://www.accounts.example/', pages)).toBe(false)
	})

	it('a path-scoped page matches the path and below it, never a longer segment', () => {
		const pages: SignInPage[] = [{host: {kind: 'suffix', domain: 'site.example'}, paths: ['/login', '/accounts/login']}]
		for (const raw of ['https://site.example/login', 'https://www.site.example/login/', 'https://m.site.example/login/device-based/regular/?next=%2F', 'https://site.example/accounts/login/two_factor', 'https://site.example/LOGIN']) expect(page(raw, pages), raw).toBe(true)
		for (const raw of ['https://site.example/', 'https://site.example/loginhelp', 'https://site.example/watch?next=/login', 'https://site.example/accounts', 'https://notsite.example/login']) expect(page(raw, pages), raw).toBe(false)
	})
})

describe('Explore sign-in pages', () => {
	it('include Google and YouTube account hosts', () => {
		for (const raw of ['https://accounts.google.com/ServiceLogin', 'https://accounts.google.co.uk/x', 'https://accounts.youtube.com/accounts/CheckConnection', 'https://myaccount.google.com/']) expect(page(raw), raw).toBe(true)
	})

	it("include Meta's sign-in and checkpoint pages on Facebook, Instagram and Threads", () => {
		for (const raw of [
			'https://www.facebook.com/login/',
			'https://www.facebook.com/login.php?next=%2F',
			'https://m.facebook.com/login/device-based/regular/login/',
			'https://www.facebook.com/checkpoint/?next',
			'https://www.facebook.com/two_step_verification/two_factor/',
			'https://www.facebook.com/auth_platform/codesubmit/',
			'https://www.instagram.com/accounts/login/',
			'https://www.instagram.com/accounts/login/two_factor?next=%2F',
			'https://www.instagram.com/accounts/onetap/?next=%2F',
			'https://www.instagram.com/challenge/action/',
			'https://www.threads.com/login',
			'https://www.threads.net/login?show_choice_screen=false',
			'https://auth.meta.com/',
			'https://accountscenter.meta.com/password_and_security'
		])
			expect(page(raw), raw).toBe(true)
	})

	it("leave Meta's content pages to the ad blocker", () => {
		for (const raw of ['https://www.facebook.com/', 'https://www.facebook.com/watch/?v=1', 'https://www.facebook.com/marketplace/', 'https://www.instagram.com/', 'https://www.instagram.com/reel/abc/', 'https://www.instagram.com/accounts/edit/', 'https://www.threads.com/@someone', 'https://www.youtube.com/watch?v=a'])
			expect(page(raw), raw).toBe(false)
	})
})
