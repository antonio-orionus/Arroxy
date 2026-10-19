import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, ChevronDown, FileSearch, FolderOpen, PackagePlus, RefreshCw, RotateCcw, ScrollText, X} from 'lucide-react'
import type {BinaryOverrides, DependencyDiagnostic, DependencyId} from '@shared/types.js'
import {FAILURE_CODE} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Badge} from '../ui/badge.js'
import {Button} from '../ui/button.js'
import {Card} from '../ui/card.js'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../ui/collapsible.js'
import {Hint} from '../shared/Hint.js'
import {repairGroups, sharedCause, type RepairCause, type RepairGroup} from './repairGroups.js'
import {SETUP_GROUP_NAMES, type SetupToolGroup} from '../../store/warmupDownloads.js'

interface Props {
	diagnostics: Record<DependencyId, DependencyDiagnostic>
	blocking: DependencyId[]
}

const CAUSE_KEY = {
	download_failed: {title: 'repair.causes.downloadFailed.title', body: 'repair.causes.downloadFailed.body'},
	extract_failed: {title: 'repair.causes.extractFailed.title', body: 'repair.causes.extractFailed.body'},
	hash_failed: {title: 'repair.causes.hashFailed.title', body: 'repair.causes.hashFailed.body'},
	spawn_failed: {title: 'repair.causes.spawnFailed.title', body: 'repair.causes.spawnFailed.body'},
	permission_denied: {title: 'repair.causes.permissionDenied.title', body: 'repair.causes.permissionDenied.body'},
	blocked_or_quarantined: {title: 'repair.causes.blockedOrQuarantined.title', body: 'repair.causes.blockedOrQuarantined.body'},
	bad_exit_code: {title: 'repair.causes.badExitCode.title', body: 'repair.causes.badExitCode.body'},
	timeout: {title: 'repair.causes.timeout.title', body: 'repair.causes.timeout.body'},
	pair_incomplete: {title: 'repair.causes.pairIncomplete.title', body: 'repair.causes.pairIncomplete.body'},
	unknown: {title: 'repair.causes.unknown.title', body: 'repair.causes.unknown.body'}
} as const satisfies Record<RepairCause, {title: string; body: string}>

const GROUP_KEY = {engine: 'repair.groups.engine', media: 'repair.groups.media'} as const satisfies Record<SetupToolGroup, string>

const DEPENDENCY_LABEL_KEY = {'yt-dlp': 'repair.deps.ytDlp', ffmpeg: 'repair.deps.ffmpeg', ffprobe: 'repair.deps.ffprobe'} as const satisfies Record<DependencyId, string>

const OVERRIDE_KEY: Record<DependencyId, keyof BinaryOverrides> = {'yt-dlp': 'ytDlp', ffmpeg: 'ffmpeg', ffprobe: 'ffprobe'}

// Plain words up front. The real tool names only appear under "Set it up
// manually", next to the error codes, where someone searching an error needs them.
function GroupName({group, withToolName = false}: {group: SetupToolGroup; withToolName?: boolean}): ReactNode {
	const {t} = useTranslation()
	return (
		<>
			<span className="font-medium text-foreground">{t(GROUP_KEY[group])}</span>
			{withToolName && <span className="text-subtle-foreground"> {SETUP_GROUP_NAMES[group]}</span>}
		</>
	)
}

// What went wrong, in the user's terms. One shared cause reads as one message;
// different causes get one line per tool group. A setup the user stopped is
// not a failure and says so.
function CauseSummary({groups, stopped}: {groups: RepairGroup[]; stopped: boolean}): ReactNode {
	const {t} = useTranslation()
	if (stopped) {
		return (
			<div className="mt-3 space-y-1" data-testid="repair-cause" data-cause="stopped">
				<p className="font-medium text-foreground">{t('repair.stopped.title')}</p>
				<p className="text-muted-foreground">{t('repair.stopped.body')}</p>
			</div>
		)
	}
	const shared = sharedCause(groups)
	if (shared !== null) {
		return (
			<div className="mt-3 space-y-1" data-testid="repair-cause" data-cause={shared}>
				<p className="font-medium text-foreground">{t(CAUSE_KEY[shared].title)}</p>
				<p className="text-muted-foreground">{t(CAUSE_KEY[shared].body)}</p>
				<p className="pt-1 text-caption">
					{groups.map((entry, index) => (
						<span key={entry.group}>
							{index > 0 && <span className="text-subtle-foreground"> · </span>}
							<GroupName group={entry.group} />
						</span>
					))}
				</p>
			</div>
		)
	}
	return (
		<ul className="mt-3 space-y-5" data-testid="repair-causes">
			{groups.map(entry => (
				<li key={entry.group} className="space-y-0.5" data-cause={entry.cause}>
					<p className="text-caption">
						<GroupName group={entry.group} />
					</p>
					<p className="font-medium text-foreground">{t(CAUSE_KEY[entry.cause].title)}</p>
					<p className="text-muted-foreground">{t(CAUSE_KEY[entry.cause].body)}</p>
				</li>
			))}
		</ul>
	)
}

// A package manager that can install a tool group here, or null. Homebrew and
// WinGet each install both media tools at once, and yt-dlp on its own.
type PackageManager = 'homebrew' | 'winget'

function packageManagerHere(): PackageManager | null {
	if (window.platform === 'darwin') return 'homebrew'
	if (window.platform === 'win32') return 'winget'
	return null
}

const INSTALL_LABEL_KEY = {homebrew: 'repair.actions.installWithHomebrew', winget: 'repair.actions.installWithWinget'} as const satisfies Record<PackageManager, string>
const INSTALLING_KEY = {homebrew: 'repair.installing.homebrew', winget: 'repair.installing.winget'} as const satisfies Record<PackageManager, string>

// Linux has too many package managers to drive one, so it gets a pointer
// instead. A Flatpak cannot see what the host installs, so it gets nothing.
function showLinuxPackageHint(): boolean {
	return window.platform === 'linux' && window.runtimeInfo?.installChannel !== 'flatpak'
}

function ManualToolRow({id, diagnostic, onChoose}: {id: DependencyId; diagnostic: DependencyDiagnostic | undefined; onChoose: (id: DependencyId) => void}): ReactNode {
	const {t} = useTranslation()
	const repairYtDlpWithHomebrew = useAppStore(s => s.repairYtDlpWithHomebrew)
	const repairYtDlpWithWinget = useAppStore(s => s.repairYtDlpWithWinget)
	const clearBinaryOverride = useAppStore(s => s.clearBinaryOverride)
	const warmupRunning = useAppStore(s => s.warmupRunning)
	const overrides = useAppStore(s => s.settings?.common?.binaryOverrides)
	const manager = packageManagerHere()
	const failure = diagnostic?.state === 'failed' ? diagnostic.failure : undefined
	const code = failure ? (FAILURE_CODE[failure.kind] ?? 'ARX-???') : null
	const technicalDetail = failure ? `${failure.kind}${failure.osCode ? ` (${failure.osCode})` : ''}` : null
	return (
		<li className="space-y-2" data-testid={`repair-manual-${id}`}>
			<div className="flex items-center justify-between gap-2">
				<span className="font-medium text-foreground">{t(DEPENDENCY_LABEL_KEY[id])}</span>
				{code && technicalDetail && (
					<Hint label={technicalDetail}>
						<Badge variant="warning" size="sm" className="font-mono">
							{code}
						</Badge>
					</Hint>
				)}
			</div>
			{technicalDetail && <p className="font-mono text-caption text-subtle-foreground">{technicalDetail}</p>}
			<div className="flex flex-wrap gap-2">
				<Button size="sm" variant="outline" onClick={() => onChoose(id)} disabled={warmupRunning}>
					<FileSearch /> {t('repair.actions.chooseExecutable')}
				</Button>
				{id === 'yt-dlp' && manager && (
					<Button size="sm" variant="outline" onClick={() => void (manager === 'homebrew' ? repairYtDlpWithHomebrew() : repairYtDlpWithWinget())} disabled={warmupRunning}>
						<PackagePlus /> {t(INSTALL_LABEL_KEY[manager])}
					</Button>
				)}
				{overrides?.[OVERRIDE_KEY[id]] != null && (
					<Button size="sm" variant="outline" onClick={() => void clearBinaryOverride(id)} disabled={warmupRunning}>
						<RotateCcw /> {t('repair.actions.resetToDefault')}
					</Button>
				)}
			</div>
		</li>
	)
}

export function RepairPanel({diagnostics, blocking}: Props): ReactNode {
	const {t} = useTranslation()
	const repairWarmup = useAppStore(s => s.repairWarmup)
	const cancelWarmup = useAppStore(s => s.cancelWarmup)
	const setBinaryOverride = useAppStore(s => s.setBinaryOverride)
	const openBinariesDir = useAppStore(s => s.openBinariesDir)
	const openLogs = useAppStore(s => s.openLogs)
	const warmupRunning = useAppStore(s => s.warmupRunning)
	const warmupCancellable = useAppStore(s => s.warmupCancellable)
	const warmupStopped = useAppStore(s => s.warmupStopped)
	const repairFfmpegWithPackageManager = useAppStore(s => s.repairFfmpegWithPackageManager)
	const packageInstall = useAppStore(s => s.packageInstall)
	const manager = packageManagerHere()
	const groups = repairGroups(diagnostics, blocking)

	async function chooseExecutable(id: DependencyId): Promise<void> {
		const result = await window.appApi.dialog.chooseExecutable(id)
		if (!result.ok || !result.data.path) return
		await setBinaryOverride(id, result.data.path)
	}

	return (
		<div className="mt-5 w-full text-start text-sm" data-testid="repair-panel">
			<div role="alert">
				<p className="flex items-center gap-2 font-medium text-warning">
					<AlertTriangle size={16} aria-hidden /> {t('repair.title')}
				</p>
				<CauseSummary groups={groups} stopped={warmupStopped} />
			</div>

			<div className="mt-5 flex flex-wrap items-center gap-2">
				<Button variant="glow" onClick={() => void repairWarmup()} disabled={warmupRunning} data-testid="repair-retry">
					<RefreshCw className={warmupRunning ? 'animate-spin' : undefined} /> {t('repair.actions.retrySetup')}
				</Button>
				{warmupRunning && warmupCancellable && (
					<Button variant="ghost" onClick={() => void cancelWarmup()}>
						<X /> {t('repair.actions.cancel')}
					</Button>
				)}
			</div>
			{/* A package manager can take minutes and reports nothing until it is done. */}
			{packageInstall && (
				<p role="status" className="mt-3 text-caption text-muted-foreground" data-testid="repair-installing">
					{t(INSTALLING_KEY[packageInstall])}
				</p>
			)}

			{/* Someone who stopped setup asked to set it up manually: show how. */}
			<Collapsible className="mt-6" defaultOpen={warmupStopped}>
				<CollapsibleTrigger render={<Button variant="link" size="sm" className="group/manual px-0 text-muted-foreground hover:text-foreground" data-testid="repair-manual-toggle" />}>
					{t('repair.manual.toggle')}
					<ChevronDown className="transition-transform duration-200 group-data-[panel-open]/manual:rotate-180" aria-hidden />
				</CollapsibleTrigger>
				<CollapsibleContent className="mt-3 space-y-3">
					<p className="text-caption text-muted-foreground">{t('repair.manual.intro')}</p>
					{showLinuxPackageHint() && (
						<p className="text-caption text-muted-foreground" data-testid="repair-linux-hint">
							{t('repair.manual.linuxHint')}
						</p>
					)}
					{groups.map(entry => (
						<Card key={entry.group} variant="inset" size="sm" className="gap-3 px-3">
							<p className="text-caption">
								<GroupName group={entry.group} withToolName />
							</p>
							<ul className="space-y-4">
								{entry.ids.map(id => (
									<ManualToolRow key={id} id={id} diagnostic={diagnostics[id]} onChoose={id => void chooseExecutable(id)} />
								))}
							</ul>
							{/* One install supplies both media tools, so the button is the group's. */}
							{entry.group === 'media' && manager && (
								<div>
									<Button size="sm" variant="outline" onClick={() => void repairFfmpegWithPackageManager(manager)} disabled={warmupRunning} data-testid="repair-install-media">
										<PackagePlus /> {t(INSTALL_LABEL_KEY[manager])}
									</Button>
								</div>
							)}
						</Card>
					))}
					{/* Shell ops are not gated on warmupRunning: inert and useful while a repair runs. */}
					<div className="flex flex-wrap gap-2 pt-1">
						<Button size="sm" variant="ghost" onClick={() => void openBinariesDir()}>
							<FolderOpen /> {t('repair.actions.openDependencyFolder')}
						</Button>
						<Button size="sm" variant="ghost" onClick={() => void openLogs()}>
							<ScrollText /> {t('repair.actions.viewSetupLog')}
						</Button>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	)
}
