import {render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {Toaster} from '@renderer/components/ui/sonner.js'
import {notify, setNotificationSink} from '@renderer/lib/notify.js'
import {useToastSink} from '@renderer/lib/toastSink.js'

function App() {
	useToastSink()
	return <Toaster theme="dark" />
}

describe('notification surface', () => {
	it('shows a failure the user can act on, and hides one they cannot', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'info').mockImplementation(() => {})
		render(<App />)

		notify.filenameBudgetFailed('path-too-deep', '/tmp/very/deep')
		expect(await screen.findByText(/shorter folder/i)).toBeInTheDocument()

		notify.filenameShortened('A long title', ['title'])
		expect(screen.queryByText(/shortened/i)).toBeNull()

		setNotificationSink(null)
	})
})
