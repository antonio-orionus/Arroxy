import type { TokenProvider } from '@main/token/TokenProvider';

export class MockTokenProvider implements TokenProvider {
  async ensureReady(): Promise<void> {
    // No-op
  }

  async getVisitorData(): Promise<string> {
    return 'MOCK_VISITOR_DATA';
  }

  async mintToken(contentBinding: string): Promise<string> {
    return `MOCK_TOKEN_${contentBinding.slice(0, 8)}`;
  }

  releaseWindow(): void {
    // No-op
  }

  dispose(): void {
    // No-op
  }
}
