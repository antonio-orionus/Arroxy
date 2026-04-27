import fs from 'node:fs';
import type { InstallChannel } from '@shared/types';

// Detect at runtime; appName is a parameter so the module is testable without
// electron and so the app name lives in one place (package.json via app.getName()).
export function detectInstallChannel(appName: string): InstallChannel {
  const exec = process.execPath;

  if (process.platform === 'win32') {
    if (exec.includes('\\scoop\\apps\\') || exec.includes('\\ProgramData\\scoop\\apps\\')) {
      return 'scoop';
    }
    return 'direct';
  }

  if (process.platform === 'darwin') {
    if (
      fs.existsSync(`/opt/homebrew/Caskroom/${appName}`) ||
      fs.existsSync(`/usr/local/Caskroom/${appName}`)
    ) {
      return 'homebrew';
    }
    return 'direct';
  }

  return 'direct';
}
