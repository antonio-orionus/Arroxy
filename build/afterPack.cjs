const path = require('path');
const fs = require('fs');

/**
 * Wraps the Electron binary on Linux with a shell script that passes --no-sandbox.
 *
 * Why: Chromium's zygote/sandbox setup runs in C++ before Node.js initialises,
 * so app.commandLine.appendSwitch('no-sandbox') from JS is always too late.
 * AppImage FUSE mounts can't have setuid binaries, so chrome-sandbox is never
 * properly configured. Passing --no-sandbox at the OS level (before Electron
 * starts) is the only reliable fix.
 *
 * Security note: contextIsolation + sandbox:true on BrowserWindow is unaffected
 * by this flag — those are renderer-level JS isolation, not OS sandbox.
 */
exports.default = async function afterPack(context) {
  if (context.electronPlatformName !== 'linux') return;

  const execName = context.packager.executableName;
  const execPath = path.join(context.appOutDir, execName);
  const realBin = execPath + '.bin';

  fs.renameSync(execPath, realBin);

  fs.writeFileSync(
    execPath,
    `#!/bin/sh\nexec "$(dirname "$(readlink -f "$0")")/${path.basename(realBin)}" --no-sandbox "$@"\n`
  );
  fs.chmodSync(execPath, 0o755);
};
