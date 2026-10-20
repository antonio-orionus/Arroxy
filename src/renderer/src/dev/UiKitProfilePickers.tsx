import {useState, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {ChevronDown, RotateCcw, Trash2} from 'lucide-react'
import {allDownloadProfiles, BUILTIN_DOWNLOAD_PROFILES, resolveActiveDownloadProfile} from '@shared/downloadProfiles.js'
import type {DownloadProfile, DownloadProfilesPrefs} from '@shared/types.js'
import {Button} from '../components/ui/button.js'
import {ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger} from '../components/ui/context-menu.js'
import {Popover, PopoverTrigger} from '../components/ui/popover.js'
import {SectionLabel} from '../components/shared/SectionLabel.js'
import {ProfilesManageTab} from '../components/wizard/DownloadProfilesManageTab.js'
import {ProfilePickerContextItems, ProfilePickerInline, ProfilePickerMenu, type ProfilePickerLayout, type ProfilePickerPanelProps} from '../components/wizard/ProfilePicker.js'
import {profilePickerOptions} from '../components/wizard/profilePickerOptions.js'

// One set of saved profiles behind every picker below: a custom profile moved
// up the saved order, two built-ins and a custom profile hidden.
function builtin(id: string): DownloadProfile {
	const profile = BUILTIN_DOWNLOAD_PROFILES.find(candidate => candidate.id === id)
	if (!profile) throw new Error(`No built-in profile ${id}`)
	return profile
}

const PODCAST: DownloadProfile = {...builtin('audio-only'), id: 'kit-podcast', name: 'Podcast MP3', icon: 'podcast', media: {kind: 'audio-only', audio: {format: 'mp3', bitrateKbps: 128}}}
const LECTURES: DownloadProfile = {...builtin('balanced'), id: 'kit-lectures', name: 'Lectures 720p', icon: 'classes', enabled: false}

const PREFS: DownloadProfilesPrefs = {active: {kind: 'builtin', id: 'balanced'}, custom: [PODCAST, LECTURES], overrides: [], enabledOverrides: {'best-2160': false, 'best-1440': false}, order: ['balanced', 'kit-podcast', 'hd-1080', 'best-quality', 'kit-lectures']}

const ACTIVE = resolveActiveDownloadProfile(PREFS).profile
const QHD = allDownloadProfiles(PREFS).find(profile => profile.id === 'best-1440') ?? ACTIVE
const LECTURES_SAVED = allDownloadProfiles(PREFS).find(profile => profile.id === LECTURES.id) ?? LECTURES

const noop = (): void => undefined
const panelHandlers = {onPickProfile: noop, onEditProfile: noop, onNewProfile: noop}

function Variant({title, rule, children}: {title: string; rule: string; children: ReactNode}): ReactNode {
	return (
		<div className="flex flex-col gap-2">
			<SectionLabel>{title}</SectionLabel>
			<p className="text-caption text-subtle-foreground">{rule}</p>
			{children}
		</div>
	)
}

function LiveTrigger({layout, label, panel}: {layout: ProfilePickerLayout; label: string; panel: Omit<ProfilePickerPanelProps, 'layout' | 'testIdPrefix'>}): ReactNode {
	const [open, setOpen] = useState(false)
	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger
				render={
					<Button type="button" variant="outline" size="sm">
						{label}
						<ChevronDown className="transition-transform duration-200 group-aria-expanded/button:rotate-180" aria-hidden />
					</Button>
				}
			/>
			<ProfilePickerMenu {...panel} layout={layout} align="start" onClose={() => setOpen(false)} testIdPrefix="kit" />
		</Popover>
	)
}

export function UiKitProfilePickers(): ReactNode {
	const {t} = useTranslation()
	const switcher = profilePickerOptions(PREFS, {current: ACTIVE})
	const formatStep = profilePickerOptions(PREFS, {current: QHD})
	const mixedRows = profilePickerOptions(PREFS, {current: null, inUse: [LECTURES_SAVED, ACTIVE]})
	const oneRow = profilePickerOptions(PREFS, {current: PODCAST})
	return (
		<div className="flex flex-col gap-6">
			<p className="text-sm text-muted-foreground">Every picker lists your saved order. A profile something already uses but you have hidden still shows, first, tagged Hidden. The current profile has a check on a selected surface; when the rows differ, nothing is checked and Edit drops out.</p>

			<Variant title="Grid · switches the active profile" rule="Download tab profile card, Bulk URLs, Explore “Download with”. Edit, New and Manage.">
				<ProfilePickerInline {...panelHandlers} options={switcher} layout="grid" description={t('wizard.url.profile.menuDescription')} editProfile={ACTIVE} onManageProfiles={noop} testIdPrefix="kit" />
			</Variant>

			<div className="flex flex-wrap items-start gap-6">
				<Variant title="List · this download only" rule="Format step. Picked QHD 1440p, then hid it: still first, still checked.">
					<ProfilePickerInline {...panelHandlers} options={formatStep} layout="list" description={t('wizard.formats.profile.menuDescription')} editProfile={QHD} editLabel={t('wizard.formats.profile.edit', {name: QHD.name})} testIdPrefix="kit" />
				</Variant>
				<Variant title="List · playlist rows, mixed" rule="“Assign to 3 videos” and a selected row's profile button. The rows use a hidden profile: it shows first. No check, no Edit.">
					<ProfilePickerInline {...panelHandlers} options={mixedRows} layout="list" description={t('wizard.playlistProfiles.menuDescription', {count: 3})} editProfile={null} testIdPrefix="kit" />
				</Variant>
				<Variant title="List · one playlist row" rule="A row's profile button for a row on its own.">
					<ProfilePickerInline {...panelHandlers} options={oneRow} layout="list" description={t('wizard.playlistProfiles.menuDescription', {count: 1})} editProfile={PODCAST} editLabel={t('wizard.playlistProfiles.editProfile', {name: PODCAST.name})} testIdPrefix="kit" />
				</Variant>
			</div>

			<Variant title="Context menu · playlist row right-click" rule="The same options as menu items; the menu's own check marks the current profile. Right-click the area.">
				<ContextMenu>
					<ContextMenuTrigger className="grid h-24 w-full max-w-sm place-items-center rounded-lg border border-dashed text-sm text-muted-foreground">Right-click: 3 rows, mixed</ContextMenuTrigger>
					<ContextMenuContent className="min-w-64">
						<ProfilePickerContextItems options={mixedRows} label={t('wizard.playlistProfiles.assignTriggerEmpty')} onPick={noop} />
						<ContextMenuSeparator />
						<ContextMenuItem>
							<RotateCcw aria-hidden />
							{t('wizard.url.profile.reset')}
						</ContextMenuItem>
						<ContextMenuSeparator />
						<ContextMenuItem variant="destructive">
							<Trash2 aria-hidden />
							{t('wizard.playlist.removeFromListCount', {count: 3})}
						</ContextMenuItem>
					</ContextMenuContent>
				</ContextMenu>
			</Variant>

			<Variant title="Live popups" rule="The real popups, opened from a trigger.">
				<div className="flex flex-wrap gap-2">
					<LiveTrigger layout="grid" label="Grid: active profile" panel={{...panelHandlers, options: switcher, description: t('wizard.url.profile.menuDescription'), editProfile: ACTIVE, onManageProfiles: noop}} />
					<LiveTrigger layout="list" label="List: Format step" panel={{...panelHandlers, options: formatStep, description: t('wizard.formats.profile.menuDescription'), editProfile: QHD}} />
				</div>
			</Variant>

			<Variant title="Native menu · Explore link right-click" rule="Drawn by the OS: Download with ▸ the same saved order, the active profile as the selected radio item (a check on macOS, a dot on Windows and Linux). The active profile is never hidden, so nothing is tagged.">
				<ol className="w-56 rounded-md border bg-popover p-1 text-sm">
					{switcher.map(option => (
						<li key={option.profile.id} className="flex items-center gap-2 px-2 py-0.5">
							<span className="w-3 text-primary">{option.current ? '✓' : ''}</span>
							{option.profile.name}
						</li>
					))}
				</ol>
			</Variant>

			<Variant title="Editor · Profiles tab" rule="Stays an editor (every profile, hidden ones dimmed, drag to reorder) and shares the check, the selected surface and the Hidden tag.">
				<ProfilesManageTab activeProfile={ACTIVE} profiles={allDownloadProfiles(PREFS)} profilesPrefs={PREFS} onEdit={noop} onMove={noop} onPick={noop} onRemove={noop} onToggleEnabled={noop} />
			</Variant>
		</div>
	)
}
