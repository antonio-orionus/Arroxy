import {useState, useMemo, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {Clapperboard, Download, FileText, FolderOpen, House, Image, Monitor, Music, type LucideIcon} from 'lucide-react'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {WizardFooter} from './WizardFooter.js'
import {FieldError, FieldGroup} from '../ui/field.js'
import {Input} from '../ui/input.js'
import {ToggleGroup} from '../ui/toggle-group.js'
import {OptionCard} from '../shared/OptionCard.js'
import {cn, formatHomeRelativePath} from '@renderer/lib/utils.js'
import {isValidSubfolder} from '@renderer/lib/path.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'
import {SectionLabel} from '../shared/SectionLabel.js'
import {SettingSwitch} from '../shared/SettingSwitch.js'

interface Location {
	id: string
	label: string
	icon: LucideIcon
	path: string | null
}

function matchLocation(dir: string, locations: Location[]): string {
	const preset = locations.find(l => l.path !== null && l.path === dir)
	return preset?.id ?? 'custom'
}

function LocationOption({loc, path, full}: {loc: Location; path: string | null; full: boolean}): ReactNode {
	const Icon = loc.icon
	return <OptionCard value={loc.id} orientation="horizontal" icon={<Icon aria-hidden />} title={loc.label} meta={path} className={cn(full && 'col-span-2')} />
}

export function StepFolderConfirm(): ReactNode {
	const {t} = useTranslation()
	const {wizardOutputDir, wizardThumbnail, wizardTitle, wizardDuration, wizardWebpageUrl, commonPaths, advance, back, setWizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName, setWizardSubfolderEnabled, setWizardSubfolderName} = useAppStore()

	const {presets, custom, locations} = useMemo(() => {
		const presets: Location[] = (
			[
				{id: 'downloads', label: t('wizard.folder.downloads'), icon: Download, path: commonPaths?.downloads ?? null},
				{id: 'music', label: t('wizard.folder.music'), icon: Music, path: commonPaths?.music ?? null},
				{id: 'videos', label: t('wizard.folder.videos'), icon: Clapperboard, path: commonPaths?.videos ?? null},
				{id: 'desktop', label: t('wizard.folder.desktop'), icon: Monitor, path: commonPaths?.desktop ?? null},
				{id: 'documents', label: t('wizard.folder.documents'), icon: FileText, path: commonPaths?.documents ?? null},
				{id: 'pictures', label: t('wizard.folder.pictures'), icon: Image, path: commonPaths?.pictures ?? null},
				{id: 'home', label: t('wizard.folder.home'), icon: House, path: commonPaths?.home ?? null}
			] as Location[]
		).filter(p => p.path !== null)
		const custom: Location = {id: 'custom', label: t('wizard.folder.custom'), icon: FolderOpen, path: null}
		return {presets, custom, locations: [...presets, custom]}
	}, [commonPaths, t])

	const [selectedId, setSelectedId] = useState<string>(() => matchLocation(wizardOutputDir, locations))

	async function handleSelect(loc: Location): Promise<void> {
		if (loc.path !== null) {
			setSelectedId(loc.id)
			await setWizardOutputDir(loc.path)
		} else {
			const result = await window.appApi.dialog.chooseFolder()
			if (!result.ok || !result.data.path) return
			setSelectedId('custom')
			await setWizardOutputDir(result.data.path)
		}
	}

	const displayPath = (loc: Location): string | null => {
		if (loc.path === null && selectedId === 'custom') return wizardOutputDir || null
		if (loc.path === null) return null
		return formatHomeRelativePath(loc.path, commonPaths)
	}

	return (
		<div className="wizard-step flex flex-col gap-4" data-testid="step-folder">
			<VideoSummaryCard thumbnail={wizardThumbnail} title={wizardTitle} duration={wizardDuration} webpageUrl={wizardWebpageUrl} />

			<div className="flex flex-col gap-1.5">
				<SectionLabel>{t('wizard.folder.heading')}</SectionLabel>
				<ToggleGroup
					value={[selectedId]}
					onValueChange={values => {
						const next = values[0]
						const loc = locations.find(location => location.id === next)
						if (loc) void handleSelect(loc)
					}}
					spacing={1}
					className="grid w-full grid-cols-2 items-stretch"
					aria-label={t('wizard.folder.heading')}
				>
					{presets.map(loc => (
						<LocationOption key={loc.id} loc={loc} path={displayPath(loc)} full={false} />
					))}
					<LocationOption loc={custom} path={displayPath(custom)} full />
				</ToggleGroup>
			</div>

			<FieldGroup className="gap-2">
				<SettingSwitch id="folder-subfolder-toggle" label={t('wizard.folder.subfolder.toggle')} checked={wizardSubfolderEnabled} onCheckedChange={setWizardSubfolderEnabled} />
				<Input
					type="text"
					value={wizardSubfolderName}
					onChange={e => setWizardSubfolderName(e.target.value)}
					disabled={!wizardSubfolderEnabled}
					placeholder={t('wizard.folder.subfolder.placeholder')}
					maxLength={64}
					aria-invalid={wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName)}
				/>
				{wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName) ? <FieldError>{t('wizard.folder.subfolder.invalid')}</FieldError> : null}
			</FieldGroup>

			<WizardFooter>
				<Button variant="outline" type="button" onClick={back}>
					{t('common.back')}
				</Button>
				<Button variant="glow" type="button" onClick={advance} disabled={!wizardOutputDir || (wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName))}>
					{t('common.continue')}
				</Button>
			</WizardFooter>
		</div>
	)
}
