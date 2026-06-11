// @vitest-environment jsdom
import {render, screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'
import {VideoSummaryCard} from '@renderer/components/shared/VideoSummaryCard.js'
import {RadioOption} from '@renderer/components/ui/radio-option.js'
import {WizardFooter} from '@renderer/components/wizard/WizardFooter.js'

describe('wizard materials', () => {
	it('renders the sticky footer with the shared wizard chrome material', () => {
		const {container} = render(
			<WizardFooter info="Size unknown">
				<button type="button">Continue</button>
			</WizardFooter>
		)

		expect(container.firstElementChild).toHaveClass('wizard-footer-surface')
		expect(container.firstElementChild).not.toHaveClass('bg-background')
	})

	it('renders the probed media summary with the shared wizard summary material', () => {
		render(<VideoSummaryCard thumbnail="" title="Example video" duration={42} resolution="1080p" webpageUrl="https://example.com/watch?v=1" />)

		expect(screen.getByText('Example video').closest('[data-slot="video-summary-card"]')).toHaveClass('wizard-summary-surface')
	})

	it('renders selectable rows with the shared wizard choice material', () => {
		render(<RadioOption label="1080p" checked={false} onClick={() => {}} />)

		expect(screen.getByRole('radio')).toHaveClass('wizard-choice-row')
	})
})
