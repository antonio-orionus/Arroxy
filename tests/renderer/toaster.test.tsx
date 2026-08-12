import {render, screen} from '@testing-library/react'
import {afterEach, describe, expect, it} from 'vitest'
import {Toaster} from '@renderer/components/ui/sonner.js'
import {notify, setNotificationSink} from '@renderer/lib/notify.js'
import {useToastSink} from '@renderer/lib/toastSink.js'

function Harness({theme}: {theme: 'light' | 'dark'}) {
	useToastSink()
	return <Toaster theme={theme} />
}

afterEach(() => {
	setNotificationSink(null)
})

describe('Toaster', () => {
	it('renders a live region so notifications reach assistive tech', () => {
		render(<Harness theme="light" />)
		expect(document.querySelector('[aria-live]')).not.toBeNull()
	})

	it('shows a notification raised through the adapter', async () => {
		render(<Harness theme="light" />)
		notify.folderSelectFailed(new Error('boom'))
		expect(await screen.findByText(/folder picker/i)).toBeInTheDocument()
	})
})
