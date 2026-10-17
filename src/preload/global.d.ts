import type {AppApi} from '@shared/api.js'
import type {RuntimeInfo} from '@shared/runtimeInfo.js'

declare global {
	interface Window {
		appApi: AppApi
		platform: NodeJS.Platform
		appVersion: string
		runtimeInfo: RuntimeInfo
	}
}

export {}
