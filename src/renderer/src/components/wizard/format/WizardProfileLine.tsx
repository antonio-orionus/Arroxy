import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {ChevronDown, PenLine} from 'lucide-react'
import {downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {FORMAT_MODES, type FormatMode} from '@shared/schemas.js'
import {formatMode, isFormatMode} from '../../../store/wizard/formatMode.js'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {keepableEdits} from '../../../store/wizard/wizardProfileState.js'
import {AREA_LABEL_KEYS} from '../../../lib/changedAreaLabels.js'
import {Button} from '../../ui/button.js'
import {AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from '../../ui/alert-dialog.js'
import {Popover, PopoverTrigger} from '../../ui/popover.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {Hint} from '../../shared/Hint.js'
import {DownloadProfileEditor} from '../DownloadProfileEditor.js'
import {ProfilePickerMenu} from '../ProfilePicker.js'
import {buildDownloadProfileActionModel} from '../downloadProfileActions.js'
import {ProfileTag} from './ProfileTag.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'
import {ProfileSummaryContent} from '../ProfileSummaryContent.js'

const MODE_LABEL_KEYS = {video: 'wizard.formats.kind.video', 'video-only': 'wizard.formats.kind.videoOnly', audio: 'wizard.formats.kind.audio', subtitles: 'wizard.formats.kind.subtitles'} as const satisfies Record<FormatMode, string>

// A profile waiting on the user's OK to replace their changes: another one, or this one after an edit.
interface PendingProfile {
	profile: DownloadProfile
	reason: 'switch' | 'updated'
}

// "Pre-selected from <profile>" plus the Video / Audio / Subtitles switch.
// The profile opens the same menu as the URL tab's profile card, and its pencil
// edits the profile in place, so tuning a profile never leaves the download.
// Picking another profile, or saving a change to this one, re-applies it. When
// the user changed more than the streams it asks first: keep those changes on
// the new profile, or reset everything to it.
export function WizardProfileLine(): ReactNode {
	const {t, i18n} = useTranslation()
	const nameOf = useProfileDisplayName()
	const {settings, wizardOutputDir, wizardProfile, mode, hasSilentVideo, hasVideo, hasAudio, hasSubtitles, profileFallback, setFormatMode, chooseWizardProfile, saveDownloadProfile, chooseWizardFolder, dismissCallout} = useAppStore(
		useShallow(state => ({
			settings: state.settings,
			wizardOutputDir: state.wizardOutputDir,
			wizardProfile: state.wizardProfile,
			mode: formatMode(state),
			hasSilentVideo: !state.wizardIsAudioOnlySource && state.wizardFormats.some(f => f.isVideoOnly),
			hasVideo: !state.wizardIsAudioOnlySource && state.wizardFormats.some(f => !f.isAudioOnly),
			hasAudio: state.wizardFormats.length > 0,
			hasSubtitles: Object.keys(state.wizardSubtitles).length > 0 || Object.keys(state.wizardAutomaticCaptions).length > 0,
			profileFallback: state.wizardFitNotices.some(notice => notice.kind === 'video-tier-fallback'),
			setFormatMode: state.setFormatMode,
			chooseWizardProfile: state.chooseWizardProfile,
			saveDownloadProfile: state.saveDownloadProfile,
			chooseWizardFolder: state.chooseWizardFolder,
			dismissCallout: state.dismissFormatProfileCallout
		}))
	)
	// Its own shallow selector: a fresh array inside the object above would never compare equal.
	const edits = useAppStore(useShallow(keepableEdits))
	const [menuOpen, setMenuOpen] = useState(false)
	// The profile open in the editor: an existing one, or null for a new one.
	const [editing, setEditing] = useState<{profile: DownloadProfile | null} | null>(null)
	const [pending, setPending] = useState<PendingProfile | null>(null)
	const profilesPrefs = settings?.profiles
	const model = buildDownloadProfileActionModel(profilesPrefs, wizardProfile ?? undefined)
	const {activeProfile, ActiveIcon} = model
	const globalDestination = wizardOutputDir.trim() ? wizardOutputDir : (settings?.common?.defaultOutputDir ?? '')

	// Reads the saved profiles at call time: right after a save, this render's copy is stale.
	function apply(profile: DownloadProfile, keepEdits = false): void {
		chooseWizardProfile(downloadProfileRefFor(profile, useAppStore.getState().settings?.profiles), keepEdits)
	}

	function offer(next: PendingProfile): void {
		if (edits.length > 0) setPending(next)
		else apply(next.profile)
	}

	function resolve(keepEdits: boolean): void {
		if (pending) apply(pending.profile, keepEdits)
		setPending(null)
	}

	function pick(ref: DownloadProfileRef): void {
		const option = model.options.find(candidate => candidate.ref.id === ref.id && candidate.ref.kind === ref.kind)
		if (!option || option.current) return
		offer({profile: option.profile, reason: 'switch'})
	}

	// Saved without making it the app's active profile: this download is not the app's default.
	async function save(profile: DownloadProfile): Promise<void> {
		await saveDownloadProfile(profile, false)
		offer({profile, reason: editing?.profile ? 'updated' : 'switch'})
	}

	// Using the menu or the pencil is having found them, so the profile callout retires.
	function noticeProfileControls(): void {
		if (settings?.common?.formatProfileCalloutDismissed !== true) void dismissCallout()
	}

	function changeMenuOpen(open: boolean): void {
		setMenuOpen(open)
		if (open) noticeProfileControls()
	}

	function editActive(): void {
		setEditing({profile: activeProfile})
		noticeProfileControls()
	}

	const modeEnabled: Record<FormatMode, boolean> = {video: hasVideo, 'video-only': hasSilentVideo, audio: hasAudio, subtitles: hasSubtitles}
	const editLabel = t('wizard.formats.profile.edit', {name: nameOf(activeProfile)})

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-testid="wizard-profile-line">
			<div className="flex min-w-0 items-center gap-2">
				<span className="text-sm text-muted-foreground">{t('wizard.formats.profile.preselected')}</span>
				<div className="flex min-w-0 items-center gap-0.5">
					<Popover open={menuOpen} onOpenChange={changeMenuOpen}>
						<Hint label={<ProfileSummaryContent profile={activeProfile} />} delay={600}>
							<PopoverTrigger
								render={
									<Button type="button" variant="outline" size="sm" className="min-w-0 max-w-64 gap-1.5" aria-label={t('wizard.url.profile.switchAria', {profileName: nameOf(activeProfile)})} data-testid="wizard-profile-trigger">
										<ActiveIcon className="shrink-0 text-primary" aria-hidden />
										<span className="min-w-0 truncate">{nameOf(activeProfile)}</span>
										<ChevronDown className="shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/button:rotate-180" aria-hidden />
									</Button>
								}
							/>
						</Hint>
						<ProfilePickerMenu
							layout="list"
							options={model.options}
							editProfile={activeProfile}
							align="start"
							editLabel={editLabel}
							description={t('wizard.formats.profile.menuDescription')}
							onPickProfile={pick}
							onEditProfile={profile => setEditing({profile})}
							onNewProfile={() => setEditing({profile: null})}
							onClose={() => setMenuOpen(false)}
							testIdPrefix="wizard"
						/>
					</Popover>
					<Hint label={editLabel}>
						<Button type="button" variant="ghost" size="icon-sm" aria-label={editLabel} onClick={editActive} className="text-muted-foreground hover:text-foreground" data-testid="wizard-profile-edit">
							<PenLine aria-hidden />
						</Button>
					</Hint>
				</div>
				{/* The one legend for the dot on the chips this profile picked; the tag's hint says why. */}
				<ProfileTag closest={profileFallback} />
			</div>
			<ToggleGroup
				size="sm"
				variant="outline"
				value={[mode]}
				onValueChange={values => {
					const next = values[0]
					if (isFormatMode(next)) setFormatMode(next)
				}}
				aria-label={t('wizard.formats.kind.label')}
				spacing={1}
				className="ms-auto flex-wrap"
				data-testid="wizard-media-kind"
			>
				{FORMAT_MODES.map(option => (
					<ToggleGroupItem key={option} value={option} disabled={!modeEnabled[option]} data-testid={`wizard-media-kind-${option}`}>
						{t(MODE_LABEL_KEYS[option])}
					</ToggleGroupItem>
				))}
			</ToggleGroup>

			{editing ? (
				<DownloadProfileEditor
					commonPaths={settings?.common?.commonPaths}
					globalDestination={globalDestination}
					globalFilenameTemplate={settings?.common?.filenameTemplate}
					globalNativeAudioPreference={settings?.common?.nativeAudioPreference}
					globalHdrSetting={settings?.common?.hdrPreference}
					initialProfile={editing.profile}
					onChangeGlobalDestination={() => chooseWizardFolder()}
					onOpenChange={open => !open && setEditing(null)}
					onSave={save}
					open
				/>
			) : null}

			{/* An alert dialog: a click outside does not dismiss it; Escape and Cancel keep the current profile. */}
			<AlertDialog open={pending !== null} onOpenChange={open => !open && setPending(null)}>
				<AlertDialogContent data-testid="wizard-profile-switch-dialog">
					<AlertDialogHeader>
						<AlertDialogTitle>{t(pending?.reason === 'updated' ? 'wizard.formats.profile.updatedTitle' : 'wizard.formats.profile.switchTitle')}</AlertDialogTitle>
						<AlertDialogDescription>
							{t(pending?.reason === 'updated' ? 'wizard.formats.profile.updatedBody' : 'wizard.formats.profile.switchBody', {areas: new Intl.ListFormat(i18n.language, {type: 'conjunction'}).format(edits.map(area => t(AREA_LABEL_KEYS[area]))), profile: pending ? nameOf(pending.profile) : ''})}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						{pending?.reason === 'switch' ? (
							<AlertDialogCancel variant="ghost" className="sm:me-auto" data-testid="wizard-profile-switch-cancel">
								{t('common.cancel')}
							</AlertDialogCancel>
						) : null}
						<Button type="button" variant="outline" onClick={() => resolve(false)} data-testid="wizard-profile-switch-reset">
							{t('wizard.formats.profile.resetAll')}
						</Button>
						<Button type="button" variant="glow" onClick={() => resolve(true)} data-testid="wizard-profile-switch-keep">
							{t('wizard.formats.profile.keepEdits')}
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
