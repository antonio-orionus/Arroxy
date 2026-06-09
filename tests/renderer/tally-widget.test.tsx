import {afterEach, describe, expect, it, vi} from 'vitest'

const TALLY_WIDGET_SCRIPT = 'https://tally.so/widgets/embed.js'

async function loadTallyWidgetModule() {
	vi.resetModules()
	return import('@renderer/lib/tallyWidget.js')
}

function queryTallyScripts(): NodeListOf<HTMLScriptElement> {
	return document.querySelectorAll(`script[src="${TALLY_WIDGET_SCRIPT}"]`)
}

async function expectRejectsToThrow(promise: Promise<unknown>, message: string): Promise<void> {
	try {
		await promise
	} catch (error) {
		expect(error).toBeInstanceOf(Error)
		expect((error as Error).message).toContain(message)
		return
	}
	throw new Error(`Expected promise to reject with ${message}`)
}

describe('tallyWidget', () => {
	afterEach(() => {
		document.body.innerHTML = ''
		delete (window as unknown as {Tally?: unknown}).Tally
		vi.resetModules()
	})

	it('replaces a stale existing script tag instead of waiting for an event that already fired', async () => {
		const staleScript = document.createElement('script')
		staleScript.src = TALLY_WIDGET_SCRIPT
		document.body.appendChild(staleScript)
		const openPopup = vi.fn()
		const {openTallyPopup} = await loadTallyWidgetModule()

		const opened = openTallyPopup('Ek6M8B', {layout: 'modal'})
		const scripts = queryTallyScripts()
		expect(scripts).toHaveLength(1)
		expect(scripts[0]).not.toBe(staleScript)

		;(window as unknown as {Tally?: {openPopup: typeof openPopup}}).Tally = {openPopup}
		scripts[0].dispatchEvent(new Event('load'))

		await opened
		expect(openPopup).toHaveBeenCalledWith('Ek6M8B', {layout: 'modal'})
	})

	it('clears the cached load promise after a script error so retry can load a new script', async () => {
		const {openTallyPopup} = await loadTallyWidgetModule()

		const failedOpen = openTallyPopup('Ek6M8B', {hideTitle: true})
		const failedScript = queryTallyScripts()[0]
		failedScript.dispatchEvent(new Event('error'))

		await expectRejectsToThrow(failedOpen, 'Failed to load Tally widget')
		expect(queryTallyScripts()).toHaveLength(0)

		const openPopup = vi.fn()
		const retriedOpen = openTallyPopup('Ek6M8B', {hideTitle: false})
		const retryScript = queryTallyScripts()[0]
		expect(retryScript).not.toBe(failedScript)

		;(window as unknown as {Tally?: {openPopup: typeof openPopup}}).Tally = {openPopup}
		retryScript.dispatchEvent(new Event('load'))

		await retriedOpen
		expect(openPopup).toHaveBeenCalledWith('Ek6M8B', {hideTitle: false})
	})
})
