import { BrowserWindow, session } from 'electron';
import type { TokenProvider } from '@main/token/TokenProvider';

const CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const YOUTUBE_URL = 'https://www.youtube.com?themeRefresh=1';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export class HiddenWindowTokenProvider implements TokenProvider {
  private hiddenWindow: BrowserWindow | null = null;

  private ready = false;

  private getWindow(): BrowserWindow {
    if (this.hiddenWindow && !this.hiddenWindow.isDestroyed()) {
      return this.hiddenWindow;
    }

    this.hiddenWindow = new BrowserWindow({
      show: false,
      width: 1280,
      height: 720,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
        session: session.fromPartition('persist:youtube-hidden')
      }
    });

    this.hiddenWindow.setSkipTaskbar(true);
    this.hiddenWindow.on('closed', () => {
      this.hiddenWindow = null;
      this.ready = false;
    });

    return this.hiddenWindow;
  }

  async ensureReady(): Promise<void> {
    if (this.ready) return;

    const win = this.getWindow();

    await new Promise<void>((resolve, reject) => {
      win.webContents.once('did-finish-load', () => resolve());
      win.webContents.once('did-fail-load', (_, code, description) => {
        reject(new Error(`YouTube failed to load: ${description} (${code})`));
      });
      void win.loadURL(YOUTUBE_URL, { userAgent: CHROME_UA });
    });

    const found = await this.pollForWebPoClient(win, 20_000);
    if (!found) {
      throw new Error('WebPoClient was not found on the loaded page');
    }

    this.ready = true;
  }

  async getVisitorData(): Promise<string> {
    const win = this.getWindow();
    await this.ensureReady();
    return win.webContents.executeJavaScript(
      `(function(){try{return window.ytcfg?.get?.('VISITOR_DATA')||window.ytcfg?.data_?.VISITOR_DATA||'';}catch(e){return '';}})()`
    );
  }

  async mintToken(contentBinding: string): Promise<string> {
    await this.ensureReady();
    const win = this.getWindow();

    const backoffMs = 1_000;
    const maxTries = 10;

    for (let attempt = 0; attempt < maxTries; attempt += 1) {
      const result = await win.webContents.executeJavaScript(`
        (async function() {
          try {
            const keys = new Set([...Object.keys(window.top), ...Object.getOwnPropertyNames(window.top)]);
            let factory = null;
            for (const key of keys) {
              try {
                const candidate = window.top[key];
                if (candidate && typeof candidate === 'object' && candidate.bevasrs && typeof candidate.bevasrs.wpc === 'function') {
                  factory = candidate.bevasrs.wpc;
                  break;
                }
              } catch {
                // Keep scanning.
              }
            }

            if (!factory) return { error: 'WebPoClient global not found' };
            const client = await factory();
            const token = await client.mws({ c: ${JSON.stringify(contentBinding)}, mc: false, me: false });
            if (token === undefined || token === null) return { error: 'mws() returned null' };
            return { token: String(token) };
          } catch (error) {
            if (String(error).includes('SDF:notready')) return { backoff: true };
            return { error: error instanceof Error ? error.message : String(error) };
          }
        })()
      `);

      if (result?.token) return result.token as string;
      if (result?.backoff) {
        await delay(backoffMs);
        continue;
      }

      throw new Error(`Token minting failed: ${result?.error ?? 'unknown error'}`);
    }

    throw new Error('Timed out waiting for WebPoClient readiness');
  }

  releaseWindow(): void {
    if (this.hiddenWindow && !this.hiddenWindow.isDestroyed()) {
      this.hiddenWindow.destroy();
    }
    this.hiddenWindow = null;
    this.ready = false;
  }

  dispose(): void {
    this.releaseWindow();
  }

  private async pollForWebPoClient(win: BrowserWindow, timeoutMs: number): Promise<boolean> {
    const script = `(function(){
      try {
        const keys = new Set([...Object.keys(window.top), ...Object.getOwnPropertyNames(window.top)]);
        for (const key of keys) {
          try {
            const candidate = window.top[key];
            if (candidate && typeof candidate === 'object' && candidate.bevasrs && typeof candidate.bevasrs.wpc === 'function') {
              return true;
            }
          } catch {
            // Keep scanning.
          }
        }
      } catch {
        // Ignore and retry.
      }
      return false;
    })()`;

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const found = (await win.webContents.executeJavaScript(script)) as boolean;
      if (found) return true;
      await delay(500);
    }

    return false;
  }
}
