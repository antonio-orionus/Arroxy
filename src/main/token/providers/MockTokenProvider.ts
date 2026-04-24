import type { TokenProvider } from '@main/token/TokenProvider';

export class MockTokenProvider implements TokenProvider {
  async ensureReady(): Promise<void> {
    return Promise.resolve();
  }

  async getVisitorData(): Promise<string> {
    return 'MOCK_VISITOR_DATA';
  }

  async mintToken(contentBinding: string): Promise<string> {
    return `MOCK_TOKEN_${contentBinding.slice(0, 8)}`;
  }

  dispose(): void {
    // No-op
  }
}
