import path from 'node:path';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';

// electron-builder flips configured fuses *after* this hook and immediately
// before signing (see platformPackager.doAddElectronFuses). Both branches below
// rewrite or sign the Electron binary themselves, so they must flip the fuses
// first and then disable the later built-in pass.
async function applyConfiguredFuses(context) {
	const configuredFuses = context.packager.config.electronFuses;
	if (configuredFuses == null) return;

	const fuseConfig = await context.packager.generateFuseConfig(configuredFuses);
	await context.packager.addElectronFuses(context, fuseConfig);
	context.packager.config.electronFuses = null;
}

// macOS: give the bundle a real ad-hoc signature under our own bundle id.
//
// Why: Arroxy ships unsigned (mac.identity is null), which leaves the prebuilt
// Electron binary carrying only the *linker's* ad-hoc signature. That signature
// declares `Identifier=Electron` and does not cover Info.plist, so the declared
// CFBundleIdentifier is untrusted metadata. macOS attributes notifications by
// code-signing identifier, not CFBundleIdentifier, so the packaged app posted as
// "Electron" — the same permanently-unauthorized identity the unsigned dev shell
// uses. The OS dropped every notification in silence and never showed the
// one-time permission prompt.
//
// An ad-hoc signature carrying the right identifier and sealing Info.plist is
// enough to fix attribution; it does not need a Developer ID and does not change
// Gatekeeper's verdict on the download (still quarantined, still unnotarized).
// --deep re-signs the nested frameworks and helpers innermost-first.
async function signMacBundleAdHoc(context) {
	const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
	const identifier = context.packager.appInfo.id;

	execFileSync('codesign', ['--force', '--deep', '--sign', '-', '--identifier', identifier, appPath], {stdio: 'inherit'});
}

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
function wrapLinuxExecutable(context) {
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

export default async function afterPack(context) {
	const platform = context.electronPlatformName;
	if (platform !== 'linux' && platform !== 'darwin') return;

	await applyConfiguredFuses(context);

	if (platform === 'darwin') {
		await signMacBundleAdHoc(context);
		return;
	}

	wrapLinuxExecutable(context);
}
