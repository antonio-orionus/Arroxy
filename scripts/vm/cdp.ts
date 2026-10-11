// Drives a running Arroxy window over the Chrome DevTools Protocol, for VM
// scripts that need to act like the user (click the update banner) without a
// desktop session of their own. The app must be launched with
// --remote-debugging-port and that port forwarded to this machine; see
// scripts/vm/_ubu-vm.sh.
//
// Usage: bun scripts/vm/cdp.ts <command> [--port 9339] [--out file.png]
//   buttons       print the visible button labels (what is on screen)
//   screenshot    save a screenshot to --out
//   click-update  dismiss What's new if shown, wait for the update banner, click Install & Restart
//   wait-text <t> wait until the text is on screen (e.g. the banner's update command)

import {parseArgs} from 'node:util'
import {chromium, type Page} from '@playwright/test'

const COMMANDS = ['buttons', 'screenshot', 'click-update', 'wait-text'] as const
type Command = (typeof COMMANDS)[number]

const isCommand = (value: string | undefined): value is Command => COMMANDS.some(command => command === value)

const {positionals, values} = parseArgs({allowPositionals: true, options: {port: {type: 'string', default: '9339'}, out: {type: 'string'}, timeout: {type: 'string', default: '30000'}}})
const [command, argument] = positionals
if (!isCommand(command)) {
	console.error(`usage: bun scripts/vm/cdp.ts <${COMMANDS.join('|')}> [text] [--port N] [--out file.png] [--timeout ms]`)
	process.exit(2)
}
const timeout = Number(values.timeout)

async function appPage(): Promise<Page> {
	const browser = await chromium.connectOverCDP(`http://127.0.0.1:${values.port}`, {timeout})
	const page = browser
		.contexts()
		.flatMap(context => context.pages())
		.find(candidate => candidate.url().endsWith('/renderer/index.html'))
	if (!page) throw new Error('no Arroxy renderer page found on the CDP endpoint')
	return page
}

async function clickUpdate(page: Page): Promise<void> {
	// The What's new dialog can open at any point during startup and makes the
	// rest of the window inert, so keep dismissing it until the banner is usable.
	const whatsNewContinue = page.getByRole('dialog').getByRole('button', {name: 'Continue'})
	const install = page.getByRole('button', {name: 'Install & Restart'})
	const deadline = Date.now() + timeout
	for (;;) {
		if (await whatsNewContinue.isVisible()) await whatsNewContinue.click()
		else if (await install.isVisible()) break
		if (Date.now() > deadline) {
			const labels = await page.getByRole('button').allInnerTexts()
			throw new Error(`update banner did not appear within ${timeout}ms (is the build new enough to honour ARROXY_UPDATE_FEED_URL?). Visible buttons: ${labels.join(' | ')}`)
		}
		await page.waitForTimeout(250)
	}
	await install.click()
	console.log('clicked Install & Restart')
}

const page = await appPage()
switch (command) {
	case 'buttons':
		console.log((await page.getByRole('button').allInnerTexts()).filter(Boolean).join('\n'))
		break
	case 'screenshot':
		if (!values.out) throw new Error('screenshot needs --out <file.png>')
		await page.screenshot({path: values.out})
		console.log(values.out)
		break
	case 'click-update':
		await clickUpdate(page)
		break
	case 'wait-text':
		if (!argument) throw new Error('wait-text needs the text to wait for')
		try {
			await page.getByText(argument, {exact: false}).first().waitFor({state: 'visible', timeout})
		} catch {
			throw new Error(`"${argument}" did not appear within ${timeout}ms. Visible buttons: ${(await page.getByRole('button').allInnerTexts()).join(' | ')}`)
		}
		console.log(`found: ${argument}`)
		break
}
// The app quits right after the click, so never wait on a graceful disconnect.
process.exit(0)
