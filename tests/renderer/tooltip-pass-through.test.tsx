import {fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vite-plus/test'
import {Hint} from '@renderer/components/shared/Hint.js'
import {TooltipProvider} from '@renderer/components/ui/tooltip.js'
import {movePointerOntoTooltip} from '../shared/tooltipPointer.js'

// A tooltip is read, never handled: the pointer passes through it to what lies
// beneath, and its text can't be selected by a fast sweep across it.
describe('tooltips', () => {
	it('let the pointer through and keep their text unselectable', async () => {
		render(
			<TooltipProvider>
				<Hint label="Saved order">
					<button type="button">Trigger</button>
				</Hint>
			</TooltipProvider>
		)
		fireEvent.mouseEnter(screen.getByRole('button', {name: 'Trigger'}))

		const popup = (await screen.findByText('Saved order')).closest('[data-slot="tooltip-content"]')
		expect(popup).toHaveClass('pointer-events-none', 'select-none')
	})

	it('close when the pointer moves from the trigger onto them', async () => {
		render(
			<TooltipProvider>
				<Hint label="Saved order">
					<button type="button">Trigger</button>
				</Hint>
			</TooltipProvider>
		)
		await movePointerOntoTooltip(screen.getByRole('button', {name: 'Trigger'}), 'Saved order')

		expect(screen.queryByText('Saved order')).not.toBeInTheDocument()
	})
})
