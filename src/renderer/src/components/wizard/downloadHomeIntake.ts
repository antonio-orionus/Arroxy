import {useCallback, useEffect, useRef, useState, type RefObject} from 'react'
import {useTranslation} from 'react-i18next'
import {bulkLogger} from '@renderer/lib/bulkLogger.js'
import {notify} from '@renderer/lib/notify.js'
import {useAppStore} from '../../store/useAppStore.js'
import {buildClipboardCandidate, resolveClipboardIntake, type ClipboardCandidate} from './clipboardIntake.js'

function isBrowserMockBulkDialogScenario(scenario: string | null): boolean {
	return scenario === 'profiles-bulk' || scenario === 'profiles-bulk-huge-input'
}

function browserMockBulkInitialRaw(scenario: string | null): string {
	if (scenario !== 'profiles-bulk-huge-input') return ''
	return [
		'vite v8.0.16 building ssr environment for development...',
		'4 modules transformed.',
		'out/preload/index.cjs  9.02 kB',
		'',
		'built in 14ms',
		'',
		'electron preload scripts built successfully',
		'',
		'-----',
		'',
		'dev server running for the electron renderer process at:',
		'',
		'  -> Local:   http://localhost:5173/',
		'  -> Network: use --host to expose',
		'',
		'starting electron app...',
		'',
		...Array.from({length: 180}, (_, index) => {
			const seconds = String(index % 60).padStart(2, '0')
			return `17:20:${seconds}.${String(index).padStart(3, '0')}          > gpu features { 2d_canvas: 'disabled_software', direct_rendering_display_compositor: 'disabled_off_ok', gpu_compositing: 'disabled_software', multiple_raster_threads: 'enabled_on', opengl: 'disabled_off', rasterization: 'disabled_software', video_decode: 'disabled_software', vulkan: 'disabled_off' }`
		})
	].join('\n')
}

export interface BulkUrlDialogState {
	bulkOpen: boolean
	// Mirrors `bulkOpen` for the clipboard listener, which subscribes once.
	bulkOpenRef: RefObject<boolean>
	bulkInitialRaw: string
	openBulkDialog: () => void
	handleBulkOpenChange: (next: boolean) => void
}

export function useBulkUrlDialog(initialBrowserMockScenario: string | null): BulkUrlDialogState {
	const bulkOpenRef = useRef(false)
	const [bulkOpen, setBulkOpen] = useState(() => isBrowserMockBulkDialogScenario(initialBrowserMockScenario))
	const [bulkInitialRaw, setBulkInitialRaw] = useState(() => browserMockBulkInitialRaw(initialBrowserMockScenario))

	useEffect(() => {
		bulkOpenRef.current = bulkOpen
	}, [bulkOpen])

	function openBulkDialog(): void {
		setBulkInitialRaw('')
		setBulkOpen(true)
	}

	function handleBulkOpenChange(next: boolean): void {
		setBulkOpen(next)
		if (!next) setBulkInitialRaw('')
	}

	return {bulkOpen, bulkOpenRef, bulkInitialRaw, openBulkDialog, handleBulkOpenChange}
}

export interface ClipboardIntakeState {
	pendingClipboard: ClipboardCandidate | null
	setPendingClipboard: (candidate: ClipboardCandidate | null) => void
	consumeClipboardCandidate: (candidate: ClipboardCandidate) => void
}

// Copied links reach the home through the clipboard watcher: fill the URL
// field, hold the link while the field or the bulk dialog is busy, or hint at
// the bulk dialog for a list.
export function useClipboardIntake({bulkOpenRef, setWizardUrl}: {bulkOpenRef: RefObject<boolean>; setWizardUrl: (url: string) => void}): ClipboardIntakeState {
	const {t} = useTranslation()
	const [pendingClipboard, setPendingClipboard] = useState<ClipboardCandidate | null>(null)

	const consumeClipboardCandidate = useCallback(
		(candidate: ClipboardCandidate): void => {
			setPendingClipboard(null)

			const url = candidate.acceptedUrls[0]
			if (!url) return
			setWizardUrl(url)
			notify.clipboard(t('wizard.url.clipboard.autofilledLink'))
		},
		[setWizardUrl, t]
	)

	useEffect(() => {
		return window.appApi.events.onClipboardUrl(payload => {
			const state = useAppStore.getState()
			const action = resolveClipboardIntake({candidate: buildClipboardCandidate(payload), hasInput: state.wizardUrl.trim().length > 0, formatsLoading: state.formatsLoading, quickPreparing: state.quickDownloadStatus === 'preparing', bulkOpen: bulkOpenRef.current})

			if (action.kind === 'ignore') return
			if (action.kind === 'store-pending') {
				setPendingClipboard(action.candidate)
				if (bulkOpenRef.current) bulkLogger.info('Clipboard URL held while bulk dialog is open', {accepted: action.candidate.count})
				return
			}
			if (action.kind === 'hint-bulk') {
				notify.clipboard(t('wizard.url.clipboard.bulkHint'))
				return
			}
			consumeClipboardCandidate(action.candidate)
		})
	}, [bulkOpenRef, consumeClipboardCandidate, t])

	return {pendingClipboard, setPendingClipboard, consumeClipboardCandidate}
}
