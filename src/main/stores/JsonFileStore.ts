import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonFileStore {
  protected readonly filePath: string;

  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  protected async readJson<T>(fallback: T, onError?: (err: unknown) => void): Promise<T> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (err) {
      onError?.(err);
      return fallback;
    }
  }

  protected writeJson(value: unknown): Promise<void> {
    const write = this.writeQueue.then(() =>
      fs.mkdir(path.dirname(this.filePath), { recursive: true })
        .then(() => fs.writeFile(this.filePath, JSON.stringify(value, null, 2), 'utf-8'))
    );
    // Keep the queue alive on failure so subsequent writes don't deadlock,
    // but log the failure so it's visible. Callers awaiting `write` still see
    // the rejection.
    this.writeQueue = write.catch((err) => {
      console.error(`[JsonFileStore] write failed for ${this.filePath}:`, err);
    });
    return write;
  }
}
