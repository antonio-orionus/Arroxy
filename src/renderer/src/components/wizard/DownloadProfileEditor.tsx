import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {RotateCcw} from 'lucide-react'
import {DEFAULTS} from '@shared/constants.js'
import type {CommonSettings, DownloadProfile, HdrSetting, NativeAudioPreference} from '@shared/types.js'
import {createDownloadProfileDraft, downloadProfileFromDraft, type DownloadProfileDraft, type DownloadProfileDraftAction, updateDownloadProfileDraft, validateDownloadProfileDraft} from '../../store/wizard/downloadProfileDraft.js'
import {Alert, AlertDescription} from '../ui/alert.js'
import {Button} from '../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {ScrollArea} from '../ui/scroll-area.js'
import {Hint} from '../shared/Hint.js'
import {ProfileIdentityPanel} from './ProfileIdentityPanel.js'
import {ProfileDownloadTypePanel, ProfileMediaPanels} from './ProfileMediaPanels.js'
import {ProfileSubtitlesPanel} from './ProfileSubtitlesPanel.js'
import {ProfileAdvancedPanel} from './ProfileAdvancedPanel.js'
import {useProfileDestinationControls} from './useProfileDestinationControls.js'

interface ResetProfileAction {
	enabled: boolean
	onReset: () => Promise<void> | void
}

interface DownloadProfileEditorProps {
	commonPaths?: CommonSettings['commonPaths']
	globalDestination?: string
	globalFilenameTemplate?: string
	// Stereo or surround from Settings, shown as what "Use app setting" means.
	globalNativeAudioPreference?: NativeAudioPreference
	globalHdrSetting?: HdrSetting
	initialProfile?: DownloadProfile | null
	onChangeGlobalDestination?: () => Promise<void> | void
	onOpenChange: (open: boolean) => void
	onSave?: (profile: DownloadProfile) => void | Promise<void>
	open: boolean
	resetProfile?: ResetProfileAction
}

function createProfileId(): string {
	if (typeof crypto !== 'undefined') {
		if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
		if (typeof crypto.getRandomValues === 'function') {
			const bytes = crypto.getRandomValues(new Uint8Array(16))
			bytes[6] = (bytes[6] & 0x0f) | 0x40
			bytes[8] = (bytes[8] & 0x3f) | 0x80
			const hex = [...bytes].map(byte => byte.toString(16).padStart(2, '0'))
			return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`
		}
	}
	return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

interface ProfileEditorActionsOptions {
	draft: DownloadProfileDraft
	onOpenChange: (open: boolean) => void
	onSave?: (profile: DownloadProfile) => void | Promise<void>
	resetProfile?: ResetProfileAction
}

interface ProfileEditorActions {
	profileActionError: string | null
	setProfileActionError: (error: string | null) => void
	saveProfile: () => Promise<void>
	resetProfileOverride: () => Promise<void>
}

// Save and reset, and the editor-wide error either one (or a destination
// action) reports above the form.
function useProfileEditorActions({draft, onOpenChange, onSave, resetProfile}: ProfileEditorActionsOptions): ProfileEditorActions {
	const {t} = useTranslation()
	const [profileActionError, setProfileActionError] = useState<string | null>(null)

	async function saveProfile(): Promise<void> {
		setProfileActionError(null)
		const now = new Date().toISOString()
		const profile = downloadProfileFromDraft(draft, now, createProfileId)
		try {
			await onSave?.(profile)
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to save profile settings', error)
			setProfileActionError(t('wizard.profileEditor.error.save'))
		}
	}

	async function resetProfileOverride(): Promise<void> {
		if (!resetProfile?.enabled) return
		setProfileActionError(null)
		try {
			await resetProfile.onReset()
			onOpenChange(false)
		} catch (error) {
			console.error('Failed to reset profile settings', error)
			setProfileActionError(t('wizard.profileEditor.error.reset'))
		}
	}

	return {profileActionError, setProfileActionError, saveProfile, resetProfileOverride}
}

export function DownloadProfileEditor({
	commonPaths,
	globalDestination = '',
	globalFilenameTemplate = DEFAULTS.filenameTemplate,
	globalNativeAudioPreference = DEFAULTS.nativeAudioPreference,
	globalHdrSetting = DEFAULTS.hdrPreference,
	initialProfile = null,
	onChangeGlobalDestination,
	onOpenChange,
	onSave,
	open,
	resetProfile
}: DownloadProfileEditorProps): ReactNode {
	const {t} = useTranslation()
	const [draft, setDraft] = useState(() => createDownloadProfileDraft(initialProfile))
	const [profileIconPickerOpen, setProfileIconPickerOpen] = useState(false)
	const validation = validateDownloadProfileDraft(draft)
	const {subfolderInvalid, filenameTemplateError, subtitleLanguagesMissing} = validation

	function updateDraft(action: DownloadProfileDraftAction): void {
		setDraft(current => updateDownloadProfileDraft(current, action))
	}

	const {profileActionError, setProfileActionError, saveProfile, resetProfileOverride} = useProfileEditorActions({draft, onOpenChange, onSave, resetProfile})
	const destinationControls = useProfileDestinationControls({initialProfile, destination: draft.destination, onAction: updateDraft, onActionError: setProfileActionError, onChangeGlobalDestination})

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[58rem]" data-testid="profiles-editor-dialog">
				<DialogHeader>
					<DialogTitle>{t('wizard.profileEditor.dialogTitle')}</DialogTitle>
					<DialogDescription>{t('wizard.profileEditor.dialogDescription')}</DialogDescription>
				</DialogHeader>
				{profileActionError ? (
					<Alert variant="destructive" size="sm">
						<AlertDescription>{profileActionError}</AlertDescription>
					</Alert>
				) : null}
				<ScrollArea className="max-h-[min(78vh,46rem)]">
					<div className="grid gap-4 p-1 pr-3 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.85fr)]">
						<div className="flex flex-col gap-3">
							<ProfileIdentityPanel profileName={draft.profileName} profileIcon={draft.profileIcon} iconPickerOpen={profileIconPickerOpen} onIconPickerOpenChange={setProfileIconPickerOpen} onAction={updateDraft} />

							<ProfileDownloadTypePanel mediaMode={draft.mediaMode} onAction={updateDraft} />

							<ProfileMediaPanels draft={draft} globalNativeAudioPreference={globalNativeAudioPreference} globalHdrSetting={globalHdrSetting} onAction={updateDraft} />

							<ProfileSubtitlesPanel draft={draft} subtitleLanguagesMissing={subtitleLanguagesMissing} onAction={updateDraft} />
						</div>

						<ProfileAdvancedPanel draft={draft} validation={validation} commonPaths={commonPaths} globalDestination={globalDestination} globalFilenameTemplate={globalFilenameTemplate} destinationControls={destinationControls} onAction={updateDraft} />
					</div>
				</ScrollArea>
				<ProfileEditorFooter resetProfile={resetProfile} saveDisabled={subfolderInvalid || filenameTemplateError !== null || subtitleLanguagesMissing} onReset={resetProfileOverride} onCancel={() => onOpenChange(false)} onSave={saveProfile} />
			</DialogContent>
		</Dialog>
	)
}

interface ProfileEditorFooterProps {
	resetProfile?: ResetProfileAction
	saveDisabled: boolean
	onReset: () => Promise<void>
	onCancel: () => void
	onSave: () => Promise<void>
}

function ProfileEditorFooter({resetProfile, saveDisabled, onReset, onCancel, onSave}: ProfileEditorFooterProps): ReactNode {
	const {t} = useTranslation()

	return (
		<DialogFooter className="sm:justify-between">
			<div className="flex min-w-0 flex-1">
				{resetProfile ? (
					<Hint label={t(resetProfile.enabled ? 'wizard.profileEditor.action.resetHint' : 'wizard.profileEditor.action.resetDisabledHint')}>
						<Button type="button" variant="ghost" onClick={() => void onReset()} disabled={!resetProfile.enabled} focusableWhenDisabled>
							<RotateCcw data-icon="inline-start" aria-hidden />
							{t('wizard.profileEditor.action.reset')}
						</Button>
					</Hint>
				) : null}
			</div>
			<div className="flex flex-col-reverse gap-2 sm:flex-row">
				<Button type="button" variant="outline" onClick={onCancel}>
					{t('common.cancel')}
				</Button>
				<Button variant="glow" type="button" onClick={() => void onSave()} disabled={saveDisabled}>
					{t('wizard.profileEditor.action.save')}
				</Button>
			</div>
		</DialogFooter>
	)
}
