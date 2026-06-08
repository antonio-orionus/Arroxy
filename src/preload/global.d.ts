import type {AppApi} from '@shared/api.js'

declare global {
	interface Window {
		appApi: AppApi
		platform: NodeJS.Platform
		appVersion: string
		__arroxyBrowserMockShowStartupSplash?: boolean
	}
}

export {}
