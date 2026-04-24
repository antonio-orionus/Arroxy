export interface TokenProvider {
  ensureReady(): Promise<void>;
  getVisitorData(): Promise<string>;
  mintToken(contentBinding: string): Promise<string>;
  releaseWindow(): void;
  dispose(): void;
}
