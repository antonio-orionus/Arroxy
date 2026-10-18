import {lazy, Suspense, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import type {DownloadHomeView} from '../../store/downloadHomeView.js'
import {Spinner} from '../ui/spinner.js'
import type {ProfileEditorState} from './useProfileEditor.js'

const DownloadProfileEditor = lazy(() => import('./DownloadProfileEditor.js').then(module => ({default: module.DownloadProfileEditor})))

interface ProfileEditorDialogProps {
	editor: ProfileEditorState
	view: Pick<DownloadHomeView, 'chooseWizardFolder' | 'commonPaths' | 'globalDestinationRoot' | 'saveDownloadProfile'>
}

export function ProfileEditorDialog({editor, view}: ProfileEditorDialogProps): ReactNode {
	const {t} = useTranslation()
	const nativeAudioPreference = useAppStore(state => state.settings?.common?.nativeAudioPreference)
	const hdrPreference = useAppStore(state => state.settings?.common?.hdrPreference)
	if (!editor.editorOpen) return null
	return (
		<Suspense
			fallback={
				<output className="fixed inset-0 z-50 grid place-items-center bg-background/35" aria-label={t('wizard.formats.loadingAria')}>
					<Spinner className="size-5 text-primary" aria-hidden />
				</output>
			}
		>
			<DownloadProfileEditor
				key={editor.editorSessionId}
				commonPaths={view.commonPaths}
				globalDestination={view.globalDestinationRoot}
				globalNativeAudioPreference={nativeAudioPreference}
				globalHdrSetting={hdrPreference}
				initialProfile={editor.editingProfile}
				onChangeGlobalDestination={() => view.chooseWizardFolder()}
				open={editor.editorOpen}
				onOpenChange={editor.setEditorOpen}
				onSave={profile => view.saveDownloadProfile(profile)}
				resetProfile={editor.editorResetProfile}
			/>
		</Suspense>
	)
}
