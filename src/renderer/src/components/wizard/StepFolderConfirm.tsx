import {useState, useMemo, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'
import {WizardFooter} from './WizardFooter.js'
import {Field, FieldError, FieldGroup, FieldLabel} from '../ui/field.js'
import {Switch} from '../ui/switch.js'
import {Input} from '../ui/input.js'
import {ToggleGroup, ToggleGroupItem} from '../ui/toggle-group.js'
import {cn, formatHomeRelativePath} from '@renderer/lib/utils.js'
import {isValidSubfolder} from '@renderer/lib/path.js'
import {VideoSummaryCard} from '../shared/VideoSummaryCard.js'

interface Location {
	id: string
	label: string
	icon: string
	path: string | null
}

function matchLocation(dir: string, locations: Location[]): string {
	const preset = locations.find(l => l.path !== null && l.path === dir)
	return preset?.id ?? 'custom'
}

function LocationOption({loc, path, full}: {loc: Location; path: string | null; full: boolean}): ReactNode {
	return (
		<ToggleGroupItem value={loc.id} className={cn('h-auto min-h-9 justify-start gap-3 px-2 aria-pressed:border-[var(--brand)] aria-pressed:bg-[var(--brand-dim)] aria-pressed:text-[var(--brand)]', full && 'col-span-2')}>
			<span className="text-base leading-none" aria-hidden>
				{loc.icon}
			</span>
			<span className="min-w-0 flex-1 truncate text-start">{loc.label}</span>
			{path ? <code className="max-w-[140px] truncate font-mono text-[12px] text-[var(--text-subtle)]">{path}</code> : null}
		</ToggleGroupItem>
	)
}

export function StepFolderConfirm(): ReactNode {
	const {t} = useTranslation()
	const {wizardOutputDir, wizardThumbnail, wizardTitle, wizardDuration, wizardWebpageUrl, commonPaths, advance, back, setWizardOutputDir, wizardSubfolderEnabled, wizardSubfolderName, setWizardSubfolderEnabled, setWizardSubfolderName} = useAppStore()

	const {presets, custom, locations} = useMemo(() => {
		const presets: Location[] = (
			[
				{id: 'downloads', label: t('wizard.folder.downloads'), icon: '📁', path: commonPaths?.downloads ?? null},
				{id: 'music', label: t('wizard.folder.music'), icon: '🎵', path: commonPaths?.music ?? null},
				{id: 'videos', label: t('wizard.folder.videos'), icon: '🎬', path: commonPaths?.videos ?? null},
				{id: 'desktop', label: t('wizard.folder.desktop'), icon: '🖥', path: commonPaths?.desktop ?? null},
				{id: 'documents', label: t('wizard.folder.documents'), icon: '📄', path: commonPaths?.documents ?? null},
				{id: 'pictures', label: t('wizard.folder.pictures'), icon: '🖼', path: commonPaths?.pictures ?? null},
				{id: 'home', label: t('wizard.folder.home'), icon: '🏠', path: commonPaths?.home ?? null}
			] as Location[]
		).filter(p => p.path !== null)
		const custom: Location = {id: 'custom', label: t('wizard.folder.custom'), icon: '📂', path: null}
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
				<p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--text-subtle)]">{t('wizard.folder.heading')}</p>
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
				<Field orientation="horizontal" className="items-center gap-2.5">
					<Switch checked={wizardSubfolderEnabled} onCheckedChange={setWizardSubfolderEnabled} aria-label={t('wizard.folder.subfolder.toggle')} />
					<FieldLabel className="text-[13px] font-medium text-foreground">{t('wizard.folder.subfolder.toggle')}</FieldLabel>
				</Field>
				<Input
					type="text"
					value={wizardSubfolderName}
					onChange={e => setWizardSubfolderName(e.target.value)}
					disabled={!wizardSubfolderEnabled}
					placeholder={t('wizard.folder.subfolder.placeholder')}
					maxLength={64}
					aria-invalid={wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName)}
					className="ms-[42px] w-[calc(100%-42px)]"
				/>
				{wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName) ? <FieldError className="ms-[42px] text-[12px]">{t('wizard.folder.subfolder.invalid')}</FieldError> : null}
			</FieldGroup>

			<WizardFooter>
				<Button variant="ghost" type="button" onClick={back} className="border-[1.5px] border-[var(--border-strong)] text-muted-foreground hover:text-foreground">
					{t('common.back')}
				</Button>
				<Button type="button" onClick={advance} disabled={!wizardOutputDir || (wizardSubfolderEnabled && wizardSubfolderName.trim() !== '' && !isValidSubfolder(wizardSubfolderName))} className="shadow-[0_4px_14px_var(--brand-glow)] disabled:shadow-none">
					{t('common.continue')}
				</Button>
			</WizardFooter>
		</div>
	)
}
