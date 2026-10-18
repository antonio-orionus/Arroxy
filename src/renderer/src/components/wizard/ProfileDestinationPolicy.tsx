import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Folder, FolderCog} from 'lucide-react'
import type {CommonSettings} from '@shared/types.js'
import {effectiveOutputDir} from '@shared/subfolder.js'
import {cn, formatHomeRelativePath} from '@renderer/lib/utils.js'
import {defaultProfileSubfolderName, type DownloadProfileDraft} from '../../store/wizard/downloadProfileDraft.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Field, FieldError, FieldLabel} from '../ui/field.js'
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from '../ui/input-group.js'
import {Hint} from '../shared/Hint.js'
import type {ProfileDestinationControls} from './useProfileDestinationControls.js'

function readablePath(path: string, commonPaths: CommonSettings['commonPaths']): string {
	const trimmed = path.trim()
	if (!trimmed) return 'Default downloads folder'
	return commonPaths ? formatHomeRelativePath(trimmed, commonPaths) : trimmed
}

function fallbackFinalPath(subfolderName: string): string {
	const trimmed = subfolderName.trim()
	return trimmed ? `Default downloads folder / ${trimmed}` : 'Default downloads folder'
}

interface ResolvedProfileDestination {
	globalDestinationRoot: string
	hasDestinationOverride: boolean
	// The folder files land in, or '' while neither root is known.
	resolvedDestination: string
	resolvedDestinationLabel: string
}

function resolveProfileDestination({destination, saveInsideSubfolder, subfolderName, profileName}: DownloadProfileDraft, globalDestination: string, commonPaths: CommonSettings['commonPaths']): ResolvedProfileDestination {
	const destinationOverride = destination.trim()
	const globalDestinationRoot = globalDestination.trim()
	const destinationBase = destinationOverride || globalDestinationRoot
	const resolvedSubfolderName = saveInsideSubfolder ? subfolderName.trim() || defaultProfileSubfolderName(profileName) : ''
	const resolvedDestination = destinationBase ? effectiveOutputDir(destinationBase, saveInsideSubfolder, resolvedSubfolderName) : ''
	return {globalDestinationRoot, hasDestinationOverride: destinationOverride.length > 0, resolvedDestination, resolvedDestinationLabel: resolvedDestination ? readablePath(resolvedDestination, commonPaths) : fallbackFinalPath(resolvedSubfolderName)}
}

interface ProfileDestinationPolicyProps {
	draft: DownloadProfileDraft
	commonPaths?: CommonSettings['commonPaths']
	globalDestination: string
	controls: ProfileDestinationControls
}

// Where a profile saves: the global destination, the profile's own override
// root, and the folder that results once the subfolder is added.
export function ProfileDestinationPolicy({draft, commonPaths, globalDestination, controls}: ProfileDestinationPolicyProps): ReactNode {
	const {t} = useTranslation()
	const {globalDestinationRoot, hasDestinationOverride, resolvedDestination, resolvedDestinationLabel} = resolveProfileDestination(draft, globalDestination, commonPaths)

	return (
		<div className="grid gap-2" data-testid="profiles-editor-destination-policy">
			<GlobalDestinationCard globalDestinationRoot={globalDestinationRoot} commonPaths={commonPaths} hasDestinationOverride={hasDestinationOverride} controls={controls} />
			<ProfileOverrideCard destination={draft.destination} hasDestinationOverride={hasDestinationOverride} controls={controls} />

			<div className="rounded-lg border border-border-strong bg-background/35 px-3 py-2" data-testid="profiles-editor-final-destination">
				<p className="text-caption font-medium text-subtle-foreground">{t('wizard.profileEditor.destination.resolved')}</p>
				<Hint label={resolvedDestination || resolvedDestinationLabel} reveal>
					<p className="mt-1 truncate font-mono text-xs text-foreground">{resolvedDestinationLabel}</p>
				</Hint>
			</div>
		</div>
	)
}

interface GlobalDestinationCardProps {
	globalDestinationRoot: string
	commonPaths?: CommonSettings['commonPaths']
	hasDestinationOverride: boolean
	controls: ProfileDestinationControls
}

function GlobalDestinationCard({globalDestinationRoot, commonPaths, hasDestinationOverride, controls}: GlobalDestinationCardProps): ReactNode {
	const {t} = useTranslation()

	return (
		<div className={cn('rounded-lg border bg-background/25 p-3 transition-colors', hasDestinationOverride ? 'border-border' : 'border-primary/55 bg-primary/12')} data-testid="profiles-editor-global-destination">
			<div className="min-w-0">
				<div className="flex min-w-0 items-center gap-2">
					<FolderCog className="size-4 shrink-0 text-primary" aria-hidden />
					<span className="text-xs font-semibold">{t('wizard.profileEditor.destination.global')}</span>
					<Badge variant={hasDestinationOverride ? 'outline' : 'secondary'}>{hasDestinationOverride ? 'Inherited' : 'Active'}</Badge>
				</div>
				<Hint label={globalDestinationRoot} reveal>
					<p className="mt-1 truncate font-mono text-xs text-subtle-foreground">{readablePath(globalDestinationRoot, commonPaths)}</p>
				</Hint>
			</div>
			<div className="mt-2 flex flex-wrap gap-2">
				<Hint label={t('wizard.url.profile.changeGlobalDestination')}>
					<Button type="button" variant="outline" size="sm" aria-label={t('wizard.url.profile.changeGlobalDestination')} onClick={() => void controls.changeGlobalDestination()} disabled={!controls.canChangeGlobalDestination} focusableWhenDisabled className="shrink-0">
						<FolderCog data-icon="inline-start" aria-hidden />
						{t('wizard.profileEditor.action.changeGlobalShort')}
					</Button>
				</Hint>
			</div>
		</div>
	)
}

interface ProfileOverrideCardProps {
	destination: string
	hasDestinationOverride: boolean
	controls: ProfileDestinationControls
}

function ProfileOverrideCard({destination, hasDestinationOverride, controls}: ProfileOverrideCardProps): ReactNode {
	const {t} = useTranslation()
	const showDestinationOverride = controls.overrideOpen || hasDestinationOverride

	return (
		<div className={cn('rounded-lg border bg-background/25 p-3 transition-colors', hasDestinationOverride ? 'border-primary/55 bg-primary/12' : 'border-border')} data-testid="profiles-editor-profile-override">
			<div className="min-w-0">
				<div className="flex min-w-0 items-center gap-2">
					<Folder className="size-4 shrink-0 text-primary" aria-hidden />
					<span className="text-xs font-semibold">{t('wizard.profileEditor.destination.override')}</span>
					<Badge variant={hasDestinationOverride ? 'secondary' : 'outline'}>{hasDestinationOverride ? 'Overrides global' : showDestinationOverride ? 'Choose folder' : 'No override set'}</Badge>
				</div>
				<p className="mt-1 text-caption leading-snug text-subtle-foreground">{hasDestinationOverride ? 'This profile saves to its own root before the subfolder is added.' : 'No override set. This profile uses the global destination above.'}</p>
			</div>
			{!showDestinationOverride ? (
				<div className="mt-2 flex flex-wrap gap-2">
					<Hint label={t('wizard.profileEditor.action.setOverride')}>
						<Button type="button" variant="outline" size="sm" aria-label={t('wizard.profileEditor.action.setOverride')} onClick={() => void controls.chooseDestinationFolder()} className="shrink-0">
							<Folder data-icon="inline-start" aria-hidden />
							{t('wizard.profileEditor.action.setOverrideShort')}
						</Button>
					</Hint>
				</div>
			) : null}

			{showDestinationOverride ? <ProfileOverridePathField destination={destination} controls={controls} /> : null}
		</div>
	)
}

interface ProfileOverridePathFieldProps {
	destination: string
	controls: ProfileDestinationControls
}

function ProfileOverridePathField({destination, controls}: ProfileOverridePathFieldProps): ReactNode {
	const {t} = useTranslation()

	return (
		<Field className="mt-3 gap-1.5">
			<FieldLabel htmlFor="profile-destination">{t('wizard.profileEditor.field.overridePath')}</FieldLabel>
			<InputGroup>
				<InputGroupInput id="profile-destination" value={destination} onChange={event => controls.changeDestination(event.target.value)} placeholder={t('wizard.profileEditor.placeholder.folder')} className="font-mono text-xs" />
				<InputGroupAddon align="inline-end">
					<InputGroupButton type="button" size="icon-xs" aria-label={t('wizard.profileEditor.action.chooseFolder')} onClick={() => void controls.chooseDestinationFolder()}>
						<Folder aria-hidden />
					</InputGroupButton>
				</InputGroupAddon>
			</InputGroup>
			<div className="flex flex-wrap items-center gap-2">
				<Button type="button" variant="ghost" size="xs" onClick={controls.clearDestinationOverride}>
					{t('wizard.profileEditor.action.useGlobalDefault')}
				</Button>
				{controls.pickerError ? <FieldError>{controls.pickerError}</FieldError> : null}
			</div>
		</Field>
	)
}
