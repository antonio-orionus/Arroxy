import { BrowserWindow, session } from 'electron';
import log from 'electron-log/main';
import type { TokenProvider } from '@main/token/TokenProvider';

const logger = log.scope('token');

const CHROME_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ' + '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
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
      // YouTube renamed `bevasrs.wpc` (the obfuscated WebPoClient factory) —
      // this is the canary for "the scrape just broke." Logging it here means
      // we see it in the logs before users start filing bugs.
      logger.warn('PoT scrape: WebPoClient global not found after 20s', {
        pageUrl: YOUTUBE_URL
      });
      throw new Error('WebPoClient was not found on the loaded page');
    }

    this.ready = true;
  }

  async getVisitorData(): Promise<string> {
    const win = this.getWindow();
    await this.ensureReady();
    const result: unknown = await win.webContents.executeJavaScript(`(function(){try{return window.ytcfg?.get?.('VISITOR_DATA')||window.ytcfg?.data_?.VISITOR_DATA||'';}catch(e){return '';}})()`);
    return typeof result === 'string' ? result : '';
  }

  async mintToken(contentBinding: string): Promise<string> {
    await this.ensureReady();
    const win = this.getWindow();

    const backoffMs = 1_000;
    const maxTries = 10;

    interface WpcResult {
      token?: string;
      backoff?: boolean;
      error?: string;
    }
    const isWpcResult = (v: unknown): v is WpcResult => typeof v === 'object' && v !== null;

    for (let attempt = 0; attempt < maxTries; attempt += 1) {
      const raw: unknown = await win.webContents.executeJavaScript(`
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
      const result: WpcResult = isWpcResult(raw) ? raw : {};

      if (typeof result.token === 'string' && result.token) return result.token;
      if (result.backoff) {
        await delay(backoffMs);
        continue;
      }

      const errorMessage = result.error ?? 'unknown error';
      logger.warn('PoT scrape: mintToken returned error', {
        error: errorMessage,
        attempt
      });
      throw new Error(`Token minting failed: ${errorMessage}`);
    }

    logger.warn('PoT scrape: mintToken timed out (SDF:notready loop)', {
      maxTries
    });
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
