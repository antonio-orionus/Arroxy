import { parseVideoId } from '@shared/url';
import type { LogService } from '@main/services/LogService';
import type { TokenProvider } from '@main/token/TokenProvider';

const TTL_MS = 5 * 60 * 60 * 1_000; // 5 hours — within ~6 h token lifetime

type TokenCache = {
  token: string;
  visitorData: string;
  mintedAt: number;
};

export class TokenService {
  private cache: TokenCache | null = null;

  constructor(
    private readonly provider: TokenProvider,
    private readonly logger: LogService
  ) {}

  async warmUp(): Promise<void> {
    try {
      await this.provider.ensureReady();
      const visitorData = await this.provider.getVisitorData();
      if (!visitorData) return;
      const token = await this.provider.mintToken(visitorData);
      this.cache = { token, visitorData, mintedAt: Date.now() };
      this.logger.log('INFO', 'PO token pre-warmed');
    } catch {
      // best-effort startup optimisation — non-fatal
    }
  }

  invalidateCache(): void {
    this.cache = null;
  }

  async mintTokenForUrl(url: string): Promise<{ token: string; visitorData: string }> {
    if (this.cache && Date.now() - this.cache.mintedAt < TTL_MS) {
      return { token: this.cache.token, visitorData: this.cache.visitorData };
    }

    await this.provider.ensureReady();
    const visitorData = await this.provider.getVisitorData();
    const binding = visitorData || parseVideoId(url) || url;

    this.logger.log('INFO', 'Minting PO token', { bindingLength: binding.length });
    const token = await this.provider.mintToken(binding);
    this.cache = { token, visitorData, mintedAt: Date.now() };
    return { token, visitorData };
  }

  dispose(): void {
    this.cache = null;
    this.provider.dispose();
  }
}
