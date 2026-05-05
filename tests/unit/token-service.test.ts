import { describe, expect, it, vi } from 'vitest';
import { TokenService } from '@main/services/TokenService';

function makeProvider(
  overrides: Partial<{
    ensureReady: () => Promise<void>;
    getVisitorData: () => Promise<string>;
    mintToken: (binding: string) => Promise<string>;
    releaseWindow: () => void;
    dispose: () => void;
  }> = {}
) {
  return {
    ensureReady: vi.fn().mockResolvedValue(undefined),
    getVisitorData: vi.fn().mockResolvedValue('visitor-abc'),
    mintToken: vi.fn().mockResolvedValue('token-xyz'),
    releaseWindow: vi.fn(),
    dispose: vi.fn(),
    ...overrides
  };
}

describe('TokenService.warmUp', () => {
  it('pre-mints token when visitorData is available and populates cache', async () => {
    const provider = makeProvider();
    const service = new TokenService(provider);

    await service.warmUp();

    expect(provider.ensureReady).toHaveBeenCalledOnce();
    expect(provider.getVisitorData).toHaveBeenCalledOnce();
    expect(provider.mintToken).toHaveBeenCalledWith('visitor-abc');

    // Cache should be populated — subsequent mintTokenForUrl does NOT call provider again
    const result = await service.mintTokenForUrl('https://youtube.com/watch?v=test');
    expect(result).toEqual({ token: 'token-xyz', visitorData: 'visitor-abc' });
    // mintToken was called once (by warmUp) and not again (cache hit)
    expect(provider.mintToken).toHaveBeenCalledOnce();
  });

  it('skips minting when visitorData is empty', async () => {
    const provider = makeProvider({ getVisitorData: vi.fn().mockResolvedValue('') });
    const service = new TokenService(provider);

    await service.warmUp();

    expect(provider.mintToken).not.toHaveBeenCalled();

    // Cache is empty — mintTokenForUrl calls provider
    const result = await service.mintTokenForUrl('https://youtube.com/watch?v=abc');
    expect(provider.mintToken).toHaveBeenCalledOnce();
    expect(result.token).toBe('token-xyz');
  });

  it('swallows errors silently when provider throws', async () => {
    const provider = makeProvider({
      ensureReady: vi.fn().mockRejectedValue(new Error('Network error'))
    });
    const service = new TokenService(provider);

    await expect(service.warmUp()).resolves.toBeUndefined();
  });
});

describe('TokenService.mintTokenForUrl', () => {
  it('returns cached token without calling provider', async () => {
    const provider = makeProvider();
    const service = new TokenService(provider);

    // Inject cache directly
    (service as unknown as { cache: unknown }).cache = {
      token: 'cached-token',
      visitorData: 'cached-visitor',
      mintedAt: Date.now()
    };

    const result = await service.mintTokenForUrl('https://youtube.com/watch?v=x');
    expect(result).toEqual({ token: 'cached-token', visitorData: 'cached-visitor' });
    expect(provider.mintToken).not.toHaveBeenCalled();
    expect(provider.ensureReady).not.toHaveBeenCalled();
  });

  it('re-mints when cache is expired', async () => {
    const provider = makeProvider();
    const service = new TokenService(provider);

    // Inject expired cache (7 hours old)
    (service as unknown as { cache: unknown }).cache = {
      token: 'stale-token',
      visitorData: 'stale-visitor',
      mintedAt: Date.now() - 7 * 60 * 60 * 1_000
    };

    const result = await service.mintTokenForUrl('https://youtube.com/watch?v=x');
    expect(provider.mintToken).toHaveBeenCalledOnce();
    expect(result.token).toBe('token-xyz');
  });

  it('populates cache on fresh mint', async () => {
    const provider = makeProvider();
    const service = new TokenService(provider);

    await service.mintTokenForUrl('https://youtube.com/watch?v=x');

    const cache = (service as unknown as { cache: { token: string; visitorData: string } | null }).cache;
    expect(cache).not.toBeNull();
    expect(cache?.token).toBe('token-xyz');
    expect(cache?.visitorData).toBe('visitor-abc');
  });
});

describe('TokenService.invalidateCache', () => {
  it('forces re-mint on next mintTokenForUrl call', async () => {
    const provider = makeProvider();
    const service = new TokenService(provider);

    await service.warmUp();
    expect(provider.mintToken).toHaveBeenCalledOnce();

    service.invalidateCache();

    await service.mintTokenForUrl('https://youtube.com/watch?v=x');
    expect(provider.mintToken).toHaveBeenCalledTimes(2);
  });
});

describe('TokenService.dispose', () => {
  it('clears cache and calls provider.dispose', async () => {
    const provider = makeProvider();
    const service = new TokenService(provider);

    await service.warmUp();

    service.dispose();

    expect(provider.dispose).toHaveBeenCalledOnce();
    const cache = (service as unknown as { cache: unknown }).cache;
    expect(cache).toBeNull();
  });
});
