import fs from 'node:fs';
import type { InstallChannel } from '@shared/types';

function detect(): InstallChannel {
  const exec = process.execPath;

  if (process.platform === 'win32') {
    if (exec.includes('\\scoop\\apps\\') || exec.includes('\\ProgramData\\scoop\\apps\\')) {
      return 'scoop';
    }
    return 'direct';
  }

  if (process.platform === 'darwin') {
    if (
      fs.existsSync('/opt/homebrew/Caskroom/arroxy') ||
      fs.existsSync('/usr/local/Caskroom/arroxy')
    ) {
      return 'homebrew';
    }
    return 'direct';
  }

  return 'direct';
}

export const installChannel: InstallChannel = detect();
