import type {ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {AlertTriangle, FolderOpen, RefreshCw, FileSearch, RotateCcw, X, PackagePlus} from 'lucide-react'
import type {BinaryOverrides, DependencyDiagnostic, DependencyFailureKind, DependencyId} from '@shared/types.js'
import {FAILURE_CODE} from '@shared/types.js'
import {useAppStore} from '../../store/useAppStore.js'
import {Button} from '../ui/button.js'

interface Props {
	diagnostics: Record<DependencyId, DependencyDiagnostic>
	blocking: DependencyId[]
}

const FAILURE_HINT_KEY = {
	download_failed: 'repair.hints.downloadFailed',
	extract_failed: 'repair.hints.extractFailed',
	hash_failed: 'repair.hints.hashFailed',
	spawn_failed: 'repair.hints.spawnFailed',
	permission_denied: 'repair.hints.permissionDenied',
	blocked_or_quarantined: 'repair.hints.blockedOrQuarantined',
	bad_exit_code: 'repair.hints.badExitCode',
	timeout: 'repair.hints.timeout',
	pair_incomplete: 'repair.hints.pairIncomplete'
} as const satisfies Record<DependencyFailureKind, string>

const DEPENDENCY_LABEL_KEY = {'yt-dlp': 'repair.deps.ytDlp', ffmpeg: 'repair.deps.ffmpeg', ffprobe: 'repair.deps.ffprobe', deno: 'repair.deps.deno'} as const satisfies Record<DependencyId, string>

const OVERRIDE_KEY: Record<DependencyId, keyof BinaryOverrides> = {'yt-dlp': 'ytDlp', ffmpeg: 'ffmpeg', ffprobe: 'ffprobe', deno: 'deno'}

export function RepairPanel({diagnostics, blocking}: Props): ReactNode {
	const {t} = useTranslation()
	const repairWarmup = useAppStore(s => s.repairWarmup)
	const repairYtDlpWithHomebrew = useAppStore(s => s.repairYtDlpWithHomebrew)
	const repairYtDlpWithWinget = useAppStore(s => s.repairYtDlpWithWinget)
	const cancelWarmup = useAppStore(s => s.cancelWarmup)
	const setBinaryOverride = useAppStore(s => s.setBinaryOverride)
	const clearBinaryOverride = useAppStore(s => s.clearBinaryOverride)
	const openBinariesDir = useAppStore(s => s.openBinariesDir)
	const openLogs = useAppStore(s => s.openLogs)
	const warmupRunning = useAppStore(s => s.warmupRunning)
	const warmupCancellable = useAppStore(s => s.warmupCancellable)
	const settings = useAppStore(s => s.settings)
	const overrides = settings?.common?.binaryOverrides
	const platform = typeof navigator !== 'undefined' ? ((navigator as {userAgentData?: {platform?: string}}).userAgentData?.platform ?? navigator.platform ?? '') : ''
	const isMac = /Mac/i.test(platform)
	const isWindows = /Win/i.test(platform)

	async function pickAndOverride(id: DependencyId): Promise<void> {
		const result = await window.appApi.dialog.chooseExecutable(id)
		if (!result.ok || !result.data.path) return
		await setBinaryOverride(id, result.data.path)
	}

	return (
		<div className="mt-4 max-w-md">
			<div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
				<AlertTriangle size={16} />
				<span className="font-medium">{t('repair.title')}</span>
			</div>
			<ul className="mt-3 space-y-3 text-start text-sm">
				{blocking.map(id => {
					const diag = diagnostics[id]
					// `in` guards forward-compat: a newer main process may serialize a
					// failure kind this renderer doesn't know about. Without the guard
					// FAILURE_HINT_KEY/FAILURE_CODE would yield undefined and crash t().
					const failureKind = diag.failure?.kind
					const knownKind = failureKind && failureKind in FAILURE_HINT_KEY ? failureKind : null
					const hintKey = knownKind ? FAILURE_HINT_KEY[knownKind] : null
					const hint = hintKey ? t(hintKey) : t('repair.hints.unknown')
					const overrideActive = overrides?.[OVERRIDE_KEY[id]] != null
					const code = knownKind ? FAILURE_CODE[knownKind] : diag.failure ? 'ARX-???' : null
					const technicalDetail = diag.failure ? `${diag.failure.kind}${diag.failure.osCode ? ` (${diag.failure.osCode})` : ''}` : 'failed'
					return (
						<li key={id} className="rounded border border-border bg-background/50 p-3">
							<div className="flex items-center justify-between gap-2">
								<span className="font-medium">{t(DEPENDENCY_LABEL_KEY[id])}</span>
								{code ? (
									<span className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" title={technicalDetail}>
										{code}
									</span>
								) : (
									<span className="text-xs text-muted-foreground">failed</span>
								)}
							</div>
							<p className="mt-1 text-xs text-muted-foreground">{hint}</p>
							<p className="mt-1 font-mono text-[10px] text-muted-foreground/70">{technicalDetail}</p>
							<div className="mt-2 flex flex-wrap gap-2">
								<Button size="sm" variant="outline" onClick={() => void pickAndOverride(id)} disabled={warmupRunning}>
									<FileSearch size={14} /> {t('repair.actions.chooseExecutable')}
								</Button>
								{id === 'yt-dlp' && isMac && (
									<Button size="sm" variant="outline" onClick={() => void repairYtDlpWithHomebrew()} disabled={warmupRunning}>
										<PackagePlus size={14} /> {t('repair.actions.installWithHomebrew')}
									</Button>
								)}
								{id === 'yt-dlp' && isWindows && (
									<Button size="sm" variant="outline" onClick={() => void repairYtDlpWithWinget()} disabled={warmupRunning}>
										<PackagePlus size={14} /> {t('repair.actions.installWithWinget')}
									</Button>
								)}
								{overrideActive && (
									<Button size="sm" variant="outline" onClick={() => void clearBinaryOverride(id)} disabled={warmupRunning}>
										<RotateCcw size={14} /> {t('repair.actions.resetToDefault')}
									</Button>
								)}
							</div>
						</li>
					)
				})}
			</ul>
			<div className="mt-4 flex flex-wrap gap-2">
				<Button size="sm" onClick={() => void repairWarmup()} disabled={warmupRunning}>
					<RefreshCw size={14} className={warmupRunning ? 'animate-spin' : undefined} /> {t('repair.actions.retrySetup')}
				</Button>
				{warmupRunning && warmupCancellable && (
					<Button size="sm" variant="outline" onClick={() => void cancelWarmup()}>
						<X size={14} /> {t('repair.actions.cancel')}
					</Button>
				)}
				{/* Shell ops below intentionally not gated on warmupRunning — inert and useful while a repair runs. */}
				<Button size="sm" variant="outline" onClick={() => void openBinariesDir()}>
					<FolderOpen size={14} /> {t('repair.actions.openDependencyFolder')}
				</Button>
				<Button size="sm" variant="outline" onClick={() => void openLogs()}>
					{t('repair.actions.viewSetupLog')}
				</Button>
			</div>
		</div>
	)
}
