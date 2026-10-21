import {test, expect} from '@playwright/test'
import type {Page} from '@playwright/test'

// The Downloads table is virtualized: rows outside the scroll box are replaced
// by padding rows sized from the virtualizer's row sizes. A row taller than its
// size (a third status line, a failed row's guidance, an open artifacts list)
// makes the padding disagree with the rows it stands for, so the visible rows
// jump whenever a tall row crosses the rendered range. Scrolling must move
// every visible row by exactly the distance scrolled.

async function openLargeQueue(page: Page): Promise<void> {
	await page.setViewportSize({width: 1280, height: 900})
	await page.goto('/?scenario=queue-large')
	await page.waitForSelector('[data-testid="app-root"]')
	await page.getByRole('tab', {name: /^downloads/i}).click()
	await expect(page.getByTestId('queue-manager-tab')).toBeVisible()
}

interface Jump {
	from: number
	row: string
	drift: number
}

// Scrolls down in fixed steps and reports each step where the row in the middle
// of the scroll box did not move by the distance scrolled.
async function scrollJumps(page: Page): Promise<Jump[]> {
	return page.evaluate(async () => {
		const scroller = document.querySelector<HTMLElement>('[data-testid="queue-manager-scroll"]')
		if (!scroller) throw new Error('Missing queue-manager-scroll')
		const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))
		const middleRow = (): HTMLElement => {
			const box = scroller.getBoundingClientRect()
			const rows = [...scroller.querySelectorAll<HTMLElement>('[data-testid^="queue-manager-row-"]')]
			const row = rows.find(candidate => candidate.getBoundingClientRect().bottom > box.top + box.height / 2)
			if (!row) throw new Error('No row in the middle of the scroll box')
			return row
		}
		const STEP = 40
		const jumps: Jump[] = []
		for (let step = 0; step < 150; step++) {
			const row = middleRow()
			const id = row.dataset.testid ?? ''
			const before = row.getBoundingClientRect().top
			const from = scroller.scrollTop
			scroller.scrollTop = from + STEP
			// Settled once the row and the scroll offset hold still for a frame.
			let settled = ''
			for (let wait = 0; wait < 20; wait++) {
				await frame()
				const position = `${scroller.scrollTop}:${scroller.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect().top}`
				if (position === settled) break
				settled = position
			}
			const moved = scroller.scrollTop - from
			const after = scroller.querySelector<HTMLElement>(`[data-testid="${id}"]`)
			const drift = after ? before - moved - after.getBoundingClientRect().top : Number.POSITIVE_INFINITY
			if (Math.abs(drift) > 1) jumps.push({from, row: id, drift})
		}
		return jumps
	})
}

test('rows with a third status line scroll with the queue, without jumps', async ({page}) => {
	await openLargeQueue(page)
	// The fixture's tall rows: finished, sound kept, subtitle languages missing.
	await expect(page.getByTestId('queue-manager-row-queue-large-4990').getByTestId('queue-subs-warning')).toBeVisible()

	expect(await scrollJumps(page)).toEqual([])
})

test('an open artifacts list scrolls with the queue, without jumps', async ({page}) => {
	await openLargeQueue(page)
	await page
		.getByTestId('queue-manager-row-queue-large-4995')
		.getByRole('button', {name: /show artifacts/i})
		.click()
	await expect(page.getByTestId('queue-artifacts-queue-large-4995')).toBeVisible()

	expect(await scrollJumps(page)).toEqual([])
})

// A filter moves rows that stay mounted to new positions: their measured sizes
// must follow the row, not the position it held. (Chromium re-measured them in
// every case tried, so this guards the path rather than reproducing a failure.)
test('rows a filter moves keep their own heights, without jumps', async ({page}) => {
	await openLargeQueue(page)
	await page.getByTestId('queue-filter-done').click()
	await expect(page.getByTestId('queue-manager-row-queue-large-4990')).toBeVisible()

	expect(await scrollJumps(page)).toEqual([])
})
