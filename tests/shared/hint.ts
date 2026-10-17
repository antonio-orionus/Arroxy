import {fireEvent, waitFor} from '@testing-library/react'

// Hovers a Hint trigger, waits for a tooltip showing `text`, then leaves it.
export async function expectHint(trigger: HTMLElement, text: string | RegExp): Promise<void> {
	fireEvent.mouseEnter(trigger)
	fireEvent.mouseMove(trigger)
	await waitFor(
		() => {
			const tips = [...document.querySelectorAll<HTMLElement>('[data-slot="tooltip-content"]')].map(tip => tip.textContent)
			if (!tips.some(tip => (typeof text === 'string' ? tip.includes(text) : text.test(tip)))) throw new Error(`no open hint shows ${String(text)}; open: ${JSON.stringify(tips)}`)
		},
		{timeout: 1500}
	)
	fireEvent.mouseLeave(trigger)
}
