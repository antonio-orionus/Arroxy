export type BridgeSource = 'preload' | 'browser-mock'

export class BridgeUnavailableError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'BridgeUnavailableError'
	}
}

export interface EnsureAppBridgeOptions {
	mode: string
	userAgent: string
	hasAppApi: () => boolean
	installBrowserMock: () => Promise<void> | void
}

export async function ensureAppBridge(options: EnsureAppBridgeOptions): Promise<BridgeSource> {
	if (options.hasAppApi()) return 'preload'

	if (options.mode === 'browser-mock') {
		return Promise.resolve(options.installBrowserMock()).then(() => {
			if (options.hasAppApi()) return 'browser-mock'
			throw new BridgeUnavailableError('Browser mock mode did not install window.appApi.')
		})
	}

	throw new BridgeUnavailableError('Electron preload bridge did not expose window.appApi.')
}

export function renderBridgeFailure(root: HTMLElement | null, error: unknown): void {
	if (!root) return
	const detail = error instanceof Error ? error.message : String(error)
	root.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#09090b;color:#f4f4f5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;">
      <section style="max-width:520px;border:1px solid rgba(255,255,255,0.14);border-radius:8px;padding:24px;background:rgba(255,255,255,0.04);">
        <h1 style="margin:0 0 10px;font-size:20px;font-weight:700;">Arroxy could not start</h1>
        <p style="margin:0;color:#d4d4d8;line-height:1.5;">The Electron preload bridge did not load, so the app cannot safely talk to the main process.</p>
        <p style="margin:14px 0 0;color:#a1a1aa;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:12px;">${escapeHtml(detail)}</p>
      </section>
    </main>
  `
}

function escapeHtml(value: string): string {
	return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
}
