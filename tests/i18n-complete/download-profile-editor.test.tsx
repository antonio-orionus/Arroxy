// @vitest-environment jsdom
import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vite-plus/test'
import {DownloadProfileEditor} from '@renderer/components/wizard/DownloadProfileEditor.js'
import {BUILTIN_DOWNLOAD_PROFILES} from '@shared/downloadProfiles.js'
import {i18next} from '@shared/i18n/index.js'
import {expectHint} from '../shared/hint.js'

describe('DownloadProfileEditor in a translated locale', () => {
	it('renders translated copy rather than raw i18n keys', async () => {
		// Asserting English would pass even if the copy were still hardcoded —
		// exactly the failure this test exists to catch. Rendering a cataloged
		// non-English locale proves the strings actually route through i18n.
		const previousLanguage = i18next.language
		await i18next.changeLanguage('de')
		try {
			const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} />)

			expect(await screen.findByText('Profilidentität')).toBeInTheDocument()
			expect(screen.getByText('Download-Typ')).toBeInTheDocument()
			expect(screen.getByLabelText('Profilsymbol wählen')).toBeInTheDocument()
			// A missing catalog entry renders the key itself, which still satisfies
			// a testid-based assertion.
			expect(document.body.textContent).not.toMatch(/wizard\.profileEditor\./)
		} finally {
			await i18next.changeLanguage(previousLanguage)
		}
	})

	it.each([
		{enabled: true, hint: 'Integrierte Profileinstellungen wiederherstellen'},
		{enabled: false, hint: 'Dieses Profil verwendet bereits die integrierten Einstellungen'}
	])('translates the reset button hint when reset is enabled=$enabled', async ({enabled, hint}) => {
		const previousLanguage = i18next.language
		await i18next.changeLanguage('de')
		try {
			const profile = BUILTIN_DOWNLOAD_PROFILES.find(item => item.id === 'balanced')
			render(<DownloadProfileEditor initialProfile={profile} open onOpenChange={() => undefined} resetProfile={{enabled, onReset: () => undefined}} />)

			const reset = await screen.findByRole('button', {name: 'Profil zurücksetzen'})
			expect(reset).not.toHaveAttribute('title')
			await expectHint(reset, hint)
		} finally {
			await i18next.changeLanguage(previousLanguage)
		}
	})
})
