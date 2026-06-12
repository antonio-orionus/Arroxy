import path from 'node:path';
import fs from 'node:fs';

// Wraps the Electron binary on Linux with a shell script that passes --no-sandbox.
//
// Why: Chromium's zygote/sandbox setup runs in C++ before Node.js initialises,
// so app.commandLine.appendSwitch('no-sandbox') from JS is always too late.
// AppImage FUSE mounts can't have setuid binaries, so chrome-sandbox is never
// properly configured. Passing --no-sandbox at the OS level (before Electron
// starts) is the only reliable fix.
//
// Security note: contextIsolation + sandbox-via-app.enableSandbox() on the
// renderer side is unaffected by this flag — those are renderer-level JS
// isolation, not OS sandbox.
export default async function afterPack(context) {
	if (context.electronPlatformName !== 'linux') return;

	// electron-builder applies configured fuses after this hook, but this hook
	// replaces the Linux executable with a shell wrapper. Flip fuses on the real
	// Electron binary first, then disable the later built-in fuse pass.
	const configuredFuses = context.packager.config.electronFuses;
	if (configuredFuses != null) {
		const fuseConfig = await context.packager.generateFuseConfig(configuredFuses);
		await context.packager.addElectronFuses(context, fuseConfig);
		context.packager.config.electronFuses = null;
	}

	const execName = context.packager.executableName;
	const execPath = path.join(context.appOutDir, execName);
	const realBin = execPath + '.bin';

	fs.renameSync(execPath, realBin);

	fs.writeFileSync(
		execPath,
		`#!/bin/sh\nexec "$(dirname "$(readlink -f "$0")")/${path.basename(realBin)}" --no-sandbox "$@"\n`
	);
	fs.chmodSync(execPath, 0o755);
}
