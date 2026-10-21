import {act, fireEvent, screen} from '@testing-library/react'

// Hovers a tooltip trigger, then moves the pointer off it and onto the open
// tooltip the way a mouse does, and lets the tooltip settle.
export async function movePointerOntoTooltip(trigger: HTMLElement, tooltipText: string): Promise<void> {
	fireEvent.pointerEnter(trigger, {pointerType: 'mouse'})
	fireEvent.mouseEnter(trigger)
	fireEvent.mouseMove(trigger, {clientX: 5, clientY: 5})
	const popup = (await screen.findByText(tooltipText)).closest('[data-slot="tooltip-content"]')
	if (!(popup instanceof HTMLElement)) throw new Error(`No tooltip holds "${tooltipText}"`)
	fireEvent.mouseLeave(trigger, {clientX: 5, clientY: -1, relatedTarget: popup})
	fireEvent.pointerEnter(popup, {pointerType: 'mouse'})
	fireEvent.mouseEnter(popup)
	fireEvent.mouseMove(popup, {clientX: 5, clientY: -5})
	await act(async () => {
		await new Promise(resolve => setTimeout(resolve, 300))
	})
}
