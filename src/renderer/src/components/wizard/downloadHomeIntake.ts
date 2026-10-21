import {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {notify} from '@renderer/lib/notify.js'
import {useAppStore} from '../../store/useAppStore.js'
import {canApplyCopiedLink, canUndoCopiedLink, resolveCopiedLink} from './clipboardIntake.js'

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
	bulkInitialRaw: string
	openBulkDialog: () => void
	openBulkDialogWith: (raw: string) => void
	handleBulkOpenChange: (next: boolean) => void
}

export function useBulkUrlDialog(initialBrowserMockScenario: string | null): BulkUrlDialogState {
	const [bulkOpen, setBulkOpen] = useState(() => isBrowserMockBulkDialogScenario(initialBrowserMockScenario))
	const [bulkInitialRaw, setBulkInitialRaw] = useState(() => browserMockBulkInitialRaw(initialBrowserMockScenario))

	function openBulkDialogWith(raw: string): void {
		setBulkInitialRaw(raw)
		setBulkOpen(true)
	}

	function openBulkDialog(): void {
		openBulkDialogWith('')
	}

	function handleBulkOpenChange(next: boolean): void {
		setBulkOpen(next)
		if (!next) setBulkInitialRaw('')
	}

	return {bulkOpen, bulkInitialRaw, openBulkDialog, openBulkDialogWith, handleBulkOpenChange}
}

// The copied link reaches the URL field once the Download tab is idle: it
// fills an empty field and replaces anything else, with Undo on the toast.
export function useCopiedLinkIntake({bulkOpen, downloadTabActive, setWizardUrl}: {bulkOpen: boolean; downloadTabActive: boolean; setWizardUrl: (url: string) => void}): void {
	const {t} = useTranslation()
	const copiedLink = useAppStore(state => state.copiedLink)
	const formatsLoading = useAppStore(state => state.formatsLoading)
	const quickPreparing = useAppStore(state => state.quickDownloadStatus === 'preparing')

	useEffect(() => {
		if (copiedLink === null || !canApplyCopiedLink({bulkOpen, downloadTabActive, formatsLoading, quickPreparing})) return
		useAppStore.setState({copiedLink: null})
		const action = resolveCopiedLink(copiedLink.url, useAppStore.getState().wizardUrl)
		if (action.kind === 'none') return
		setWizardUrl(action.url)
		const opened = copiedLink.from === 'link'
		if (action.kind === 'fill') {
			notify.clipboard(opened ? t('wizard.url.openedLink.added') : t('wizard.url.clipboard.autofilledLink'))
			return
		}
		const undo = (): void => {
			const state = useAppStore.getState()
			if (canUndoCopiedLink({wizardStep: state.wizardStep, wizardUrl: state.wizardUrl, formatsLoading: state.formatsLoading, quickPreparing: state.quickDownloadStatus === 'preparing'}, action.url)) setWizardUrl(action.previous)
		}
		notify.clipboard(opened ? t('wizard.url.openedLink.replaced') : t('wizard.url.clipboard.replacedLink'), [{label: t('wizard.url.clipboard.undo'), onClick: undo}])
	}, [bulkOpen, copiedLink, downloadTabActive, formatsLoading, quickPreparing, setWizardUrl, t])
}
