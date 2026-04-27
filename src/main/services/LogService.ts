import fs from 'node:fs';
import path from 'node:path';
import { nowIso } from '@main/utils/clock';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR';

const MAX_LOG_FILES = 5;

export class LogService {
  private readonly logsDir: string;

  private readonly sessionId: string;

  private readonly logFilePath: string;

  private readonly stream: fs.WriteStream;

  constructor(userDataPath: string) {
    this.logsDir = path.join(userDataPath, 'logs');
    fs.mkdirSync(this.logsDir, { recursive: true });

    this.sessionId = nowIso().replace(/[:.]/g, '-');
    this.logFilePath = path.join(this.logsDir, `app-${this.sessionId}.log`);
    fs.writeFileSync(this.logFilePath, '');
    this.rotateLogs();
    this.stream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
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
    this.stream.write(line);

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

  private rotateLogs(): void {
    try {
      const files = fs.readdirSync(this.logsDir);
      const logs = files
        .filter((f) => f.startsWith('app-') && f.endsWith('.log'))
        .sort();
      const toDelete = logs.slice(0, Math.max(0, logs.length - MAX_LOG_FILES));
      for (const f of toDelete) {
        try {
          fs.unlinkSync(path.join(this.logsDir, f));
        } catch {}
      }
    } catch {}
  }

  getLogsDir(): string {
    return this.logsDir;
  }

  getCurrentLogFilePath(): string {
    return this.logFilePath;
  }
}
