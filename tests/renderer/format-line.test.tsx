// @vitest-environment jsdom
import {act, fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vite-plus/test'
import {FormatChip, FormatLine} from '@renderer/components/wizard/format/FormatLine.js'
import {RadioGroup} from '@renderer/components/ui/radio-group.js'

function renderLines(onValueChange = vi.fn(), value = 'av1'): ReturnType<typeof vi.fn> {
	render(
		<RadioGroup value={value} onValueChange={onValueChange}>
			<FormatLine name="2160p" alias="4K">
				<FormatChip value="av1" name="2160p 4K · AV1 · mp4 · HDR10 · 1.0 GB" label="AV1" tags={['HDR10']} size="1.0 GB" profilePick />
				<FormatChip value="vp9" name="2160p 4K · VP9 · webm · 520 MB" label="VP9" size="520 MB" />
			</FormatLine>
			<FormatLine name="">
				<FormatChip value="none" name="No audio" label="No audio" disabled />
			</FormatLine>
		</RadioGroup>
	)
	return onValueChange
}

describe('FormatLine and FormatChip', () => {
	it('exposes each chip as a radio named by every fact about its stream, checked by the group value', () => {
		renderLines()
		expect(screen.getByRole('radio', {name: '2160p 4K · AV1 · mp4 · HDR10 · 1.0 GB'})).toHaveAttribute('aria-checked', 'true')
		expect(screen.getByRole('radio', {name: '2160p 4K · VP9 · webm · 520 MB'})).toHaveAttribute('aria-checked', 'false')
	})

	it('names the line once, with its alias beside it', () => {
		renderLines()
		expect(screen.getByText('2160p')).toHaveTextContent('2160p4K')
	})

	it('selects when any part of the chip is clicked', () => {
		const onValueChange = renderLines()
		fireEvent.click(screen.getByText('520 MB'))
		expect(onValueChange).toHaveBeenCalledWith('vp9', expect.anything())
	})

	it('does not select a disabled chip', () => {
		const onValueChange = renderLines()
		fireEvent.click(screen.getByText('No audio'))
		expect(onValueChange).not.toHaveBeenCalled()
	})

	it('marks the profile pick on the chip itself, not only in its name', () => {
		renderLines()
		expect(screen.getByRole('radio', {name: /AV1/})).toHaveAttribute('data-profile-pick')
		expect(screen.getByRole('radio', {name: /VP9/})).not.toHaveAttribute('data-profile-pick')
	})

	it('shows the full description, file type included, only after a five-second hover', () => {
		vi.useFakeTimers()
		try {
			renderLines()
			const chip = screen.getByRole('radio', {name: /VP9/})
			const openHints = (): string[] => [...document.querySelectorAll('[data-slot="tooltip-content"]')].map(tip => tip.textContent)
			fireEvent.mouseEnter(chip)
			fireEvent.mouseMove(chip)

			act(() => vi.advanceTimersByTime(4900))
			expect(openHints()).toEqual([])

			act(() => vi.advanceTimersByTime(200))
			expect(openHints().some(tip => tip.includes('2160p 4K · VP9 · webm · 520 MB'))).toBe(true)
		} finally {
			vi.useRealTimers()
		}
	})
})
