import {useId, useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useShallow} from 'zustand/react/shallow'
import {CopyPlus, PenLine, RotateCcw, Save, type LucideIcon} from 'lucide-react'
import {downloadProfileOrigin} from '@shared/downloadProfiles.js'
import {useAppStore} from '../../store/useAppStore.js'
import type {ChangedArea} from '../../store/wizard/profileApplication.js'
import {profileDiffRows} from '../../store/wizard/profileDiff.js'
import {updatedProfileDraft, wizardChangedAreas, wizardProfileSaveFailure} from '../../store/wizard/wizardProfileState.js'
import {selectWizardReviewState} from '../../store/wizard/wizardReviewState.js'
import {createTranslationPort} from '../../lib/translation.js'
import {Button} from '../ui/button.js'
import {Card} from '../ui/card.js'
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from '../ui/dialog.js'
import {Field, FieldLabel} from '../ui/field.js'
import {Input} from '../ui/input.js'
import {Hint} from '../shared/Hint.js'
import {FilenameTemplateErrorText} from '../shared/FilenameTemplateField.js'
import {AREA_LABEL_KEYS} from '../../lib/changedAreaLabels.js'
import {useProfileDisplayName} from '@renderer/lib/profileName.js'
import {formatList} from '@renderer/lib/subtitleLabel.js'

function SaveAsProfileDialog({open, onOpenChange}: {open: boolean; onOpenChange: (open: boolean) => void}): ReactNode {
	const {t} = useTranslation()
	const nameOf = useProfileDisplayName()
	const id = useId()
	const wizardProfile = useAppStore(state => state.wizardProfile)
	const profileName = wizardProfile ? nameOf(wizardProfile) : ''
	const saveWizardAsProfile = useAppStore(state => state.saveWizardAsProfile)
	const [name, setName] = useState('')
	const [saving, setSaving] = useState(false)
	const value = name || t('wizard.review.nextTime.defaultName', {profile: profileName})

	async function save(): Promise<void> {
		setSaving(true)
		let ok = false
		try {
			ok = await saveWizardAsProfile(value)
		} finally {
			setSaving(false)
		}
		if (ok) {
			setName('')
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent data-testid="save-as-profile-dialog">
				<DialogHeader>
					<DialogTitle>{t('wizard.review.save.title')}</DialogTitle>
					<DialogDescription>{t('wizard.review.save.description')}</DialogDescription>
				</DialogHeader>
				<Field className="gap-1.5">
					<FieldLabel htmlFor={id}>{t('wizard.review.save.nameLabel')}</FieldLabel>
					<Input id={id} type="text" value={value} maxLength={80} onChange={event => setName(event.target.value)} data-testid="save-as-profile-name" />
				</Field>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						{t('common.cancel')}
					</Button>
					<Button type="button" variant="glow" onClick={() => void save()} disabled={saving || value.trim() === ''} data-testid="save-as-profile-confirm">
						{t('wizard.review.save.action')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

const DIFF_LABEL_KEYS = {format: 'wizard.review.update.rows.format', subtitles: 'wizard.review.rows.subtitles', sponsorBlock: 'wizard.review.rows.sponsorBlock', extras: 'wizard.review.rows.extras', saveTo: 'wizard.review.rows.saveTo', fileName: 'wizard.review.rows.fileName'} as const satisfies Record<
	ChangedArea,
	string
>

// Confirms an update with the profile's values before and after, area by area.
function UpdateProfileDialog({open, onOpenChange}: {open: boolean; onOpenChange: (open: boolean) => void}): ReactNode {
	const {t} = useTranslation()
	const nameOf = useProfileDisplayName()
	const state = useAppStore(useShallow(selectWizardReviewState))
	const updateWizardProfile = useAppStore(s => s.updateWizardProfile)
	const [saving, setSaving] = useState(false)
	const before = state.wizardProfile
	const after = updatedProfileDraft(state)
	const rows = before && after ? profileDiffRows(before, after, {t: createTranslationPort(t), defaultOutputDir: state.settings?.common?.defaultOutputDir ?? '', globalFilenameTemplate: state.settings?.common?.filenameTemplate, commonPaths: state.commonPaths}) : []
	const name = before ? nameOf(before) : ''

	async function update(): Promise<void> {
		setSaving(true)
		let ok = false
		try {
			ok = await updateWizardProfile()
		} finally {
			setSaving(false)
		}
		if (ok) onOpenChange(false)
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent data-testid="update-profile-dialog">
				<DialogHeader>
					<DialogTitle>{t('wizard.review.update.title', {profile: name})}</DialogTitle>
					<DialogDescription>{t('wizard.review.update.description')}</DialogDescription>
				</DialogHeader>
				<Card className="gap-0 overflow-hidden py-0">
					{rows.map(row => (
						<div key={row.area} className="grid gap-1 border-t border-border px-3.5 py-2.5 text-sm first:border-t-0" data-testid={`profile-diff-${row.area}`}>
							<span className="font-semibold text-foreground">{t(DIFF_LABEL_KEYS[row.area])}</span>
							{row.before ? <span className="text-muted-foreground line-through decoration-subtle-foreground/60">{row.before}</span> : null}
							{row.after ? <span className="text-foreground">{row.after}</span> : null}
						</div>
					))}
				</Card>
				{before && downloadProfileOrigin(before, state.settings?.profiles).kind === 'builtin' ? <p className="text-caption text-subtle-foreground">{t('wizard.review.update.builtinNote')}</p> : null}
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						{t('common.cancel')}
					</Button>
					<Button type="button" variant="glow" onClick={() => void update()} disabled={saving || rows.length === 0} data-testid="update-profile-confirm">
						{t('wizard.review.update.action')}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}

// `blockedBy` disables the action and takes over its hint, saying why.
function IconAction({Icon, label, onClick, testId, blockedBy}: {Icon: LucideIcon; label: string; onClick: () => void; testId: string; blockedBy?: ReactNode}): ReactNode {
	return (
		<Hint label={blockedBy ?? label}>
			<Button type="button" variant="ghost" size="icon-sm" className="shrink-0" aria-label={label} onClick={onClick} disabled={blockedBy !== undefined} focusableWhenDisabled data-testid={testId}>
				<Icon aria-hidden />
			</Button>
		</Hint>
	)
}

// The footer row of Format and Review, only once the run differs from its
// profile: what changed, then update that profile, save a new one, or undo.
export function ProfileEditLine(): ReactNode {
	const {t, i18n} = useTranslation()
	const nameOf = useProfileDisplayName()
	const changed = useAppStore(useShallow(wizardChangedAreas))
	const wizardProfile = useAppStore(state => state.wizardProfile)
	const profileName = wizardProfile ? nameOf(wizardProfile) : ''
	const resetWizardToProfile = useAppStore(state => state.resetWizardToProfile)
	const updateFailure = useAppStore(useShallow(state => wizardProfileSaveFailure(state, false)))
	const saveAsFailure = useAppStore(useShallow(state => wizardProfileSaveFailure(state, true)))
	const [saveOpen, setSaveOpen] = useState(false)
	const [updateOpen, setUpdateOpen] = useState(false)
	if (changed.length === 0 && !saveOpen && !updateOpen) return null
	const areas = formatList(
		changed.map(area => t(AREA_LABEL_KEYS[area])),
		i18n.language,
		'conjunction'
	)

	return (
		<>
			{changed.length > 0 ? (
				<div className="flex items-center gap-2 text-sm text-muted-foreground" data-testid="review-changed-bar">
					<PenLine className="size-3.5 shrink-0 text-primary" aria-hidden />
					<Hint label={t('wizard.review.changed', {profile: profileName, areas})} reveal>
						<p className="min-w-0 flex-1 truncate">
							<span className="font-semibold text-foreground">{t('wizard.review.changedFrom', {profile: profileName})}</span> {areas}
						</p>
					</Hint>
					<IconAction Icon={Save} label={t('wizard.review.updateProfile', {profile: profileName})} onClick={() => setUpdateOpen(true)} testId="review-update-profile" blockedBy={updateFailure ? <FilenameTemplateErrorText error={updateFailure} /> : undefined} />
					<IconAction Icon={CopyPlus} label={t('wizard.review.saveAsProfile')} onClick={() => setSaveOpen(true)} testId="review-save-as-profile" blockedBy={saveAsFailure ? <FilenameTemplateErrorText error={saveAsFailure} /> : undefined} />
					<IconAction Icon={RotateCcw} label={t('wizard.review.reset', {profile: profileName})} onClick={resetWizardToProfile} testId="review-reset" />
				</div>
			) : null}
			<SaveAsProfileDialog open={saveOpen} onOpenChange={setSaveOpen} />
			{updateOpen ? <UpdateProfileDialog open onOpenChange={setUpdateOpen} /> : null}
		</>
	)
}
