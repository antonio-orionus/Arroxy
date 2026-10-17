import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {ChevronDown, PenLine} from 'lucide-react'
import {downloadProfileRefFor} from '@shared/downloadProfiles.js'
import {WIZARD_MEDIA_KINDS, type WizardMediaKind} from '@shared/schemas.js'
import type {DownloadProfile, DownloadProfileRef} from '@shared/types.js'
import {useAppStore} from '../../../store/useAppStore.js'
import {wizardChangedAreas} from '../../../store/wizard/wizardProfileState.js'
import {Button} from '../../ui/button.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../../ui/dialog.js'
import {Popover, PopoverTrigger} from '../../ui/popover.js'
import {ToggleGroup, ToggleGroupItem} from '../../ui/toggle-group.js'
import {Hint} from '../../shared/Hint.js'
import {DownloadProfileEditor} from '../DownloadProfileEditor.js'
import {DownloadProfileMenuContent} from '../DownloadProfileMenu.js'
import {buildDownloadProfileActionModel} from '../downloadProfileActions.js'
import {ProfileDot} from './FormatLine.js'
import {ProfileTag} from './ProfileTag.js'

const KIND_LABEL_KEYS = {video: 'wizard.formats.kind.video', audio: 'wizard.formats.kind.audio', subtitles: 'wizard.formats.kind.subtitles'} as const satisfies Record<WizardMediaKind, string>

// A profile waiting on the user's OK to replace their changes: another one, or this one after an edit.
interface PendingProfile {
	profile: DownloadProfile
	reason: 'switch' | 'updated'
}

function isMediaKind(value: string | undefined): value is WizardMediaKind {
	return value !== undefined && (WIZARD_MEDIA_KINDS as readonly string[]).includes(value)
}

// "Pre-selected from <profile>" plus the Video / Audio / Subtitles switch.
// The profile opens the same menu as the URL tab's profile card, and its pencil
// edits the profile in place, so tuning a profile never leaves the download.
// Picking another profile, or saving a change to this one, re-applies it to
// every setting, so it asks first when the user has changed something.
export function WizardProfileLine(): ReactNode {
	const {t} = useTranslation()
	const {settings, wizardOutputDir, wizardProfile, wizardMediaKind, hasVideo, hasAudio, hasSubtitles, hasEdits, profileFallback, setWizardMediaKind, chooseWizardProfile, saveDownloadProfile, chooseWizardFolder} = useAppStore(
		useShallow(state => ({
			settings: state.settings,
			wizardOutputDir: state.wizardOutputDir,
			wizardProfile: state.wizardProfile,
			wizardMediaKind: state.wizardMediaKind,
			hasVideo: !state.wizardIsAudioOnlySource && state.wizardFormats.some(f => !f.isAudioOnly),
			hasAudio: state.wizardFormats.length > 0,
			hasSubtitles: Object.keys(state.wizardSubtitles).length > 0 || Object.keys(state.wizardAutomaticCaptions).length > 0,
			hasEdits: wizardChangedAreas(state).length > 0,
			profileFallback: state.wizardFitNotices.some(notice => notice.kind === 'video-tier-fallback'),
			setWizardMediaKind: state.setWizardMediaKind,
			chooseWizardProfile: state.chooseWizardProfile,
			saveDownloadProfile: state.saveDownloadProfile,
			chooseWizardFolder: state.chooseWizardFolder
		}))
	)
	const [menuOpen, setMenuOpen] = useState(false)
	// The profile open in the editor: an existing one, or null for a new one.
	const [editing, setEditing] = useState<{profile: DownloadProfile | null} | null>(null)
	const [pending, setPending] = useState<PendingProfile | null>(null)
	const profilesPrefs = settings?.profiles
	const model = buildDownloadProfileActionModel(profilesPrefs, wizardProfile ?? undefined)
	const {activeProfile, ActiveIcon} = model
	const globalDestination = wizardOutputDir.trim() || (settings?.common?.defaultOutputDir ?? '')

	// Reads the saved profiles at call time: right after a save, this render's copy is stale.
	function apply(profile: DownloadProfile): void {
		chooseWizardProfile(downloadProfileRefFor(profile, useAppStore.getState().settings?.profiles))
	}

	function offer(next: PendingProfile): void {
		if (hasEdits) setPending(next)
		else apply(next.profile)
	}

	function pick(ref: DownloadProfileRef): void {
		const option = model.options.find(candidate => candidate.ref.id === ref.id && candidate.ref.kind === ref.kind)
		if (!option || option.active) return
		offer({profile: option.profile, reason: 'switch'})
	}

	// Saved without making it the app's active profile: this download is not the app's default.
	async function save(profile: DownloadProfile): Promise<void> {
		await saveDownloadProfile(profile, false)
		offer({profile, reason: editing?.profile ? 'updated' : 'switch'})
	}

	const kindEnabled: Record<WizardMediaKind, boolean> = {video: hasVideo, audio: hasAudio, subtitles: hasSubtitles}
	const editLabel = t('wizard.formats.profile.edit', {name: activeProfile.name})

	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-2" data-testid="wizard-profile-line">
			<div className="flex min-w-0 items-center gap-2">
				<span className="text-sm text-muted-foreground">{t('wizard.formats.profile.preselected')}</span>
				<div className="flex min-w-0 items-center gap-0.5">
					<Popover open={menuOpen} onOpenChange={setMenuOpen}>
						<Hint label={t('wizard.url.profile.switchTitle')}>
							<PopoverTrigger
								render={
									<Button type="button" variant="outline" size="sm" className="min-w-0 max-w-64 gap-1.5" aria-label={t('wizard.url.profile.switchAria', {profileName: activeProfile.name})} data-testid="wizard-profile-trigger">
										<ActiveIcon className="shrink-0 text-primary" aria-hidden />
										<span className="min-w-0 truncate">{activeProfile.name}</span>
										<ChevronDown className="shrink-0 text-muted-foreground transition-transform duration-200 group-aria-expanded/button:rotate-180" aria-hidden />
									</Button>
								}
							/>
						</Hint>
						<DownloadProfileMenuContent
							model={model}
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
						<Button type="button" variant="ghost" size="icon-sm" aria-label={editLabel} onClick={() => setEditing({profile: activeProfile})} className="text-muted-foreground hover:text-foreground" data-testid="wizard-profile-edit">
							<PenLine aria-hidden />
						</Button>
					</Hint>
				</div>
				{/* The one legend for the dot on the chips this profile picked; the tag's hint says why. */}
				<span className="flex items-center gap-1.5 text-caption text-subtle-foreground">
					<ProfileDot />
					<ProfileTag closest={profileFallback} />
				</span>
			</div>
			<ToggleGroup
				size="sm"
				variant="outline"
				value={[wizardMediaKind]}
				onValueChange={values => {
					const next = values[0]
					if (isMediaKind(next)) setWizardMediaKind(next)
				}}
				aria-label={t('wizard.formats.kind.label')}
				spacing={1}
				className="ms-auto flex-wrap"
				data-testid="wizard-media-kind"
			>
				{WIZARD_MEDIA_KINDS.map(kind => (
					<ToggleGroupItem key={kind} value={kind} disabled={!kindEnabled[kind]} data-testid={`wizard-media-kind-${kind}`}>
						{t(KIND_LABEL_KEYS[kind])}
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

			<Dialog open={pending !== null} onOpenChange={open => !open && setPending(null)}>
				<DialogContent data-testid="wizard-profile-switch-dialog">
					<DialogHeader>
						<DialogTitle>{t(pending?.reason === 'updated' ? 'wizard.formats.profile.updatedTitle' : 'wizard.formats.profile.switchTitle')}</DialogTitle>
						<DialogDescription>{t(pending?.reason === 'updated' ? 'wizard.formats.profile.updatedBody' : 'wizard.formats.profile.switchBody')}</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setPending(null)}>
							{pending?.reason === 'updated' ? t('wizard.formats.profile.updatedKeep') : t('common.cancel')}
						</Button>
						<Button
							type="button"
							variant="glow"
							onClick={() => {
								if (pending) apply(pending.profile)
								setPending(null)
							}}
						>
							{t(pending?.reason === 'updated' ? 'wizard.formats.profile.updatedAction' : 'wizard.formats.profile.switchAction')}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
