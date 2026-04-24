import fs from 'node:fs';
import path from 'node:path';
import { nowIso } from '@main/utils/clock';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

export class LogService {
  private readonly logsDir: string;

  private readonly sessionId: string;

  private readonly logFilePath: string;

  constructor(userDataPath: string) {
    this.logsDir = path.join(userDataPath, 'logs');
    fs.mkdirSync(this.logsDir, { recursive: true });

    this.sessionId = nowIso().replace(/[:.]/g, '-');
    this.logFilePath = path.join(this.logsDir, `app-${this.sessionId}.log`);
    this.log('INFO', 'Session started');
  }

  log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const payload = {
      at: nowIso(),
      level,
      message,
      ...(meta ? { meta } : {})
    };
    const line = `${JSON.stringify(payload)}\n`;
    fs.appendFileSync(this.logFilePath, line);

    if (level === 'ERROR') {
      console.error(line.trim());
      return;
    }

    if (level === 'WARN') {
      console.warn(line.trim());
      return;
    }

    console.log(line.trim());
  }

  getLogsDir(): string {
    return this.logsDir;
  }

  getCurrentLogFilePath(): string {
    return this.logFilePath;
  }
}
