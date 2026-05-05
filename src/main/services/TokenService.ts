import log from 'electron-log/main';
import { parseVideoId } from '@shared/url';
import { nonEmpty } from '@shared/format';
import { unknownToMessage } from '@main/utils/errorFactory';
import type { TokenProvider } from '@main/token/TokenProvider';

const logger = log.scope('token');

const TTL_MS = 5 * 60 * 60 * 1_000; // 5 hours — within ~6 h token lifetime

interface TokenCache {
  token: string;
  visitorData: string;
  mintedAt: number;
}

export class TokenService {
  private cache: TokenCache | null = null;

  constructor(private readonly provider: TokenProvider) {}

  async warmUp(): Promise<void> {
    try {
      await this.provider.ensureReady();
      const visitorData = await this.provider.getVisitorData();
      if (!visitorData) return;
      const token = await this.provider.mintToken(visitorData);
      this.cache = { token, visitorData, mintedAt: Date.now() };
      logger.info('PO token pre-warmed');
    } catch (err) {
      logger.warn('Token warm-up failed (non-fatal)', { error: unknownToMessage(err) });
    } finally {
      this.provider.releaseWindow();
    }
  }

  invalidateCache(): void {
    this.cache = null;
  }

  async mintTokenForUrl(url: string): Promise<{ token: string; visitorData: string }> {
    if (this.cache && Date.now() - this.cache.mintedAt < TTL_MS) {
      return { token: this.cache.token, visitorData: this.cache.visitorData };
    }

    try {
      await this.provider.ensureReady();
      const visitorData = await this.provider.getVisitorData();
      const binding = nonEmpty(visitorData) ?? parseVideoId(url) ?? url;

      logger.info('Minting PO token', { bindingLength: binding.length });
      const token = await this.provider.mintToken(binding);
      this.cache = { token, visitorData, mintedAt: Date.now() };
      return { token, visitorData };
    } finally {
      this.provider.releaseWindow();
    }
  }

  dispose(): void {
    this.cache = null;
    this.provider.dispose();
  }
}
