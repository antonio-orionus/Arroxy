import {vi} from 'vitest'
import type {AppApi} from '@shared/api.js'
import type {AppSettings, DependencyDiagnostic, DependencyId, WarmUpOutput} from '@shared/types.js'
import {defaultAppSettings} from '@shared/constants.js'
import {ok} from '@shared/result.js'

function runnableDeps(): Record<DependencyId, DependencyDiagnostic> {
	const make = (id: DependencyId): DependencyDiagnostic => ({id, state: 'runnable', source: {kind: 'managed', channel: 'default', url: 'mock'}, resolvedPath: `/mock/${id}`, attempts: []})
	return {'yt-dlp': make('yt-dlp'), ffmpeg: make('ffmpeg'), ffprobe: make('ffprobe'), deno: make('deno')}
}

const defaultWarmUp: WarmUpOutput = {completed: true, dependencies: runnableDeps(), blockingFailures: [], cancelled: false}

function buildMockSettings(overrides: Partial<AppSettings> = {}): AppSettings {
	return {...defaultAppSettings('/tmp'), ...overrides}
}

interface BuildMockOptions {
	settings?: Partial<AppSettings>
}

export function buildMockAppApi(options: BuildMockOptions = {}): AppApi {
	const settings = buildMockSettings(options.settings)
	return {
		app: {
			warmUp: vi.fn().mockResolvedValue(ok(defaultWarmUp)),
			cancelWarmup: vi.fn().mockResolvedValue(undefined),
			installYtDlpWithHomebrew: vi.fn().mockResolvedValue(ok({installedPath: '/opt/homebrew/bin/yt-dlp'})),
			installYtDlpWithWinget: vi.fn().mockResolvedValue(ok({installedPath: 'C:\\Users\\mock\\AppData\\Local\\Microsoft\\WinGet\\Links\\yt-dlp.exe'})),
			setLanguage: vi.fn().mockResolvedValue(undefined)
		},
		window: {minimize: vi.fn().mockResolvedValue(undefined), maximize: vi.fn().mockResolvedValue(undefined), close: vi.fn().mockResolvedValue(undefined), isMaximized: vi.fn().mockResolvedValue(false), onMaximizedChange: vi.fn().mockReturnValue(() => undefined)},
		downloads: {
			probeCancel: vi.fn().mockResolvedValue(undefined),
			probe: vi
				.fn()
				.mockResolvedValue(
					ok({
						kind: 'video' as const,
						videoId: 'dQw4w9WgXcQ',
						extractor: 'youtube',
						extractorKey: 'Youtube',
						webpageUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
						isAudioOnlySource: false,
						formats: [{formatId: '22', label: '720p | mp4', ext: 'mp4', resolution: '720p', fps: 30, isVideoOnly: false, isAudioOnly: false}],
						title: 'Test Video',
						thumbnail: '',
						subtitles: {},
						automaticCaptions: {},
						isLive: false,
						hasDrm: false
					})
				),
			start: vi.fn().mockResolvedValue(ok({job: {id: 'job-1', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', outputDir: '/tmp', status: 'running', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}})),
			cancel: vi.fn().mockResolvedValue(ok({cancelled: true})),
			pause: vi.fn().mockResolvedValue(ok({paused: true})),
			resume: vi.fn().mockResolvedValue(ok({resumed: false}))
		},
		settings: {get: vi.fn().mockResolvedValue(ok(settings)), update: vi.fn().mockResolvedValue(ok(settings))},
		shell: {openFolder: vi.fn().mockResolvedValue(ok({opened: true})), openExternal: vi.fn().mockResolvedValue(ok({opened: true})), openBinariesDir: vi.fn().mockResolvedValue(ok({opened: true}))},
		logs: {openDir: vi.fn().mockResolvedValue(ok({opened: true}))},
		dialog: {chooseFolder: vi.fn().mockResolvedValue(ok({path: '/tmp'})), chooseFile: vi.fn().mockResolvedValue(ok({path: null})), chooseExecutable: vi.fn().mockResolvedValue(ok({path: null}))},
		events: {onStatus: vi.fn().mockReturnValue(() => undefined), onProgress: vi.fn().mockReturnValue(() => undefined), onClipboardUrl: vi.fn().mockReturnValue(() => undefined), onWarmupProgress: vi.fn().mockReturnValue(() => undefined)},
		queue: {
			cmd: {
				add: vi.fn().mockResolvedValue(ok({ids: [] as string[]})),
				getSnapshot: vi.fn().mockResolvedValue(ok([] as import('@shared/types.js').QueueItem[])),
				start: vi.fn().mockResolvedValue(ok(undefined)),
				pause: vi.fn().mockResolvedValue(ok(undefined)),
				resume: vi.fn().mockResolvedValue(ok(undefined)),
				cancel: vi.fn().mockResolvedValue(ok(undefined)),
				retry: vi.fn().mockResolvedValue(ok(undefined)),
				clearCompleted: vi.fn().mockResolvedValue(ok(undefined)),
				remove: vi.fn().mockResolvedValue(ok(undefined)),
				setLane: vi.fn().mockResolvedValue(ok(undefined)),
				pauseAll: vi.fn().mockResolvedValue(ok(undefined)),
				resumeAll: vi.fn().mockResolvedValue(ok(undefined))
			},
			events: {onSnapshot: vi.fn().mockReturnValue(() => undefined), onAdded: vi.fn().mockReturnValue(() => undefined), onUpdated: vi.fn().mockReturnValue(() => undefined), onRemoved: vi.fn().mockReturnValue(() => undefined)}
		},
		updater: {onUpdateAvailable: vi.fn().mockReturnValue(() => undefined), install: vi.fn().mockResolvedValue({ok: true})},
		analytics: {track: vi.fn()},
		diagnostics: {logWizardStep: vi.fn()},
		playlist: {scanFolder: vi.fn().mockResolvedValue(ok({matchedIds: [] as string[]})), registerManifest: vi.fn().mockResolvedValue(ok(undefined))}
	}
}
