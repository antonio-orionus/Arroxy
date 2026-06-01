import log from 'electron-log/renderer.js';

type ElectronLogWindow = Window & { __electronLog?: unknown };

const scopedLogger = log.scope('bulk');

export function redactUrlForLog(url: string): string {
  try {
    const parsed = new URL(url);
    const query = parsed.search ? '?<redacted>' : '';
    const hash = parsed.hash ? '#<redacted>' : '';
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}${query}${hash}`;
  } catch {
    return '<invalid-url>';
  }
}

function canWriteToElectronLog(): boolean {
  return typeof window !== 'undefined' && Boolean((window as ElectronLogWindow).__electronLog);
}

export const bulkLogger = {
  debug: (...args: unknown[]) => {
    if (canWriteToElectronLog()) scopedLogger.debug(...args);
  },
  info: (...args: unknown[]) => {
    if (canWriteToElectronLog()) scopedLogger.info(...args);
  },
  warn: (...args: unknown[]) => {
    if (canWriteToElectronLog()) scopedLogger.warn(...args);
  }
};
