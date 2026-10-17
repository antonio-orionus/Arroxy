// @vitest-environment jsdom
import {fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import {ChoiceRow} from '@renderer/components/shared/ChoiceRow.js'
import {RadioGroup} from '@renderer/components/ui/radio-group.js'
import {expectHint} from '../shared/hint.js'

function renderGroup(onValueChange = vi.fn(), value = 'a'): ReturnType<typeof vi.fn> {
	render(
		<RadioGroup value={value} onValueChange={onValueChange}>
			<ChoiceRow id="row-a" value="a" label="2160p" meta="webm · 2.2 GB" />
			<ChoiceRow id="row-b" value="b" label="1080p" meta="mp4 · 515 MB" />
			<ChoiceRow id="row-c" value="c" label="720p" disabled />
		</RadioGroup>
	)
	return onValueChange
}

describe('ChoiceRow', () => {
	it('exposes each row as a radio named by its label, checked by the group value', () => {
		renderGroup()
		expect(screen.getByRole('radio', {name: '2160p'})).toHaveAttribute('aria-checked', 'true')
		expect(screen.getByRole('radio', {name: '1080p'})).toHaveAttribute('aria-checked', 'false')
	})

	it('selects when the row text is clicked, not only the dot', () => {
		const onValueChange = renderGroup()
		fireEvent.click(screen.getByText('mp4 · 515 MB'))
		expect(onValueChange).toHaveBeenCalledWith('b', expect.anything())
	})

	it('does not select a disabled row', () => {
		const onValueChange = renderGroup()
		fireEvent.click(screen.getByText('720p'))
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it('exposes the checked state the shared choice surface paints from', () => {
		renderGroup()
		// styles.css `choice-surface` highlights a row via :has([data-slot="radio-group-item"][data-checked]).
		const row = (text: string): HTMLElement | null => screen.getByText(text).closest('label')
		expect(row('2160p')?.querySelector('[data-slot="radio-group-item"][data-checked]')).not.toBeNull()
		expect(row('1080p')?.querySelector('[data-slot="radio-group-item"][data-checked]')).toBeNull()
		expect(row('1080p')?.classList.contains('has-[>[data-slot=field]]:choice-surface')).toBe(true)
	})
})

describe('ChoiceRow label truncation', () => {
	it('keeps the full label and details reachable when they are cut with an ellipsis', async () => {
		render(
			<RadioGroup value="en">
				<ChoiceRow id="row-en" value="en" adornment={<span data-testid="badge" />} label="English original (default)" meta="m4a · AAC · 130 kbps · 1.4 MB" />
			</RadioGroup>
		)
		await expectHint(screen.getByText('English original (default)'), 'English original (default)')
		await expectHint(screen.getByText('m4a · AAC · 130 kbps · 1.4 MB'), 'm4a · AAC · 130 kbps · 1.4 MB')
		expect(screen.getByRole('radio', {name: 'English original (default)'})).toBeInTheDocument()
	})

	it('renders the adornment beside the label, outside the truncating text', () => {
		render(
			<RadioGroup value="en">
				<ChoiceRow id="row-en" value="en" adornment={<span data-testid="badge" />} label="English" />
			</RadioGroup>
		)
		expect(screen.getByText('English').contains(screen.getByTestId('badge'))).toBe(false)
	})
})
