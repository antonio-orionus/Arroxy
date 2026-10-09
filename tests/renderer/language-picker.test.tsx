// @vitest-environment jsdom
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {LanguagePicker} from '@renderer/components/system/LanguagePicker.js'
import {useAppStore} from '@renderer/store/useAppStore.js'
import {i18next} from '@shared/i18n/index.js'
import {buildMockAppApi} from '../shared/mockAppApi.js'

describe('LanguagePicker', () => {
	beforeEach(() => {
		window.appApi = buildMockAppApi()
		useAppStore.setState({language: 'en'})
	})

	afterEach(async () => {
		await i18next.changeLanguage('en')
		document.documentElement.dir = 'ltr'
	})

	it('shows the current language by its own name', () => {
		render(<LanguagePicker />)
		expect(screen.getByRole('combobox', {name: 'Language'})).toHaveTextContent('English')
	})

	it('switches the app language from the menu, including direction for RTL scripts', async () => {
		render(<LanguagePicker />)
		fireEvent.click(screen.getByRole('combobox', {name: 'Language'}))
		const arabic = await screen.findByRole('option', {name: 'العربية'})
		// Keyboard selection: Base UI commits an option on Enter (plain jsdom clicks carry no pointer type).
		arabic.focus()
		fireEvent.keyDown(arabic, {key: 'Enter'})

		await waitFor(() => expect(useAppStore.getState().language).toBe('ar'))
		expect(document.documentElement.dir).toBe('rtl')
		expect(window.appApi.app.setLanguage).toHaveBeenCalledWith('ar')
	})
})
