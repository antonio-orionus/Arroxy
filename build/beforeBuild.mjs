// electron-builder lifecycle hook. Fires once per (platform, arch) the build
// targets. Invokes scripts/build/fetch-embedded.sh to populate
// build/embedded/<platform>-<arch>/{ffmpeg, ffprobe}[.exe] before the
// extraResources copy step packs them into the artifact.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// electron-builder Arch enum: 0=ia32, 1=x64, 2=armv7l, 3=arm64
const ARCH_NAMES = ['ia32', 'x64', 'armv7l', 'arm64'];
const ARCH_NAME_SET = new Set(ARCH_NAMES);

export function resolveBuilderArch(contextArch, hostArch = process.arch) {
  if (typeof contextArch === 'string' && ARCH_NAME_SET.has(contextArch)) {
    return contextArch;
  }
  if (typeof contextArch === 'number' && ARCH_NAMES[contextArch]) {
    return ARCH_NAMES[contextArch];
  }
  return hostArch === 'arm64' ? 'arm64' : 'x64';
}

export function requiredEmbeddedBinaryNames(platform) {
  const ext = platform === 'win32' ? '.exe' : '';
  return ['ffmpeg', 'ffprobe'].map(bin => `${bin}${ext}`);
}

function assertEmbeddedPayload(cwd, platform, archName) {
  const base = path.join(cwd, 'build', 'embedded', `${platform}-${archName}`);
  for (const fileName of requiredEmbeddedBinaryNames(platform)) {
    const filePath = path.join(base, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[beforeBuild] missing embedded ${fileName} for ${platform}-${archName}: ${filePath}`);
    }
  }
}

export default async function beforeBuild(context) {
  const platform = context.platform.nodeName; // 'win32' | 'darwin' | 'linux'
  const archName = resolveBuilderArch(context.arch);
  console.log(`[beforeBuild] context.arch=${context.arch} → ${archName} (host=${process.arch})`);
  const cwd = context.appDir ?? process.cwd();
  const script = path.join(cwd, 'scripts', 'build', 'fetch-embedded.sh');
  console.log(`[beforeBuild] fetch ffmpeg/ffprobe for ${platform}-${archName} (context.arch=${context.arch}, host=${process.arch})`);
  execFileSync('bash', [script, platform, archName], { stdio: 'inherit', cwd });
  assertEmbeddedPayload(cwd, platform, archName);
  // Returning falsy here makes electron-builder treat node_modules as
  // "handled externally" and skip the prod-deps install/copy entirely
  // (app-builder-lib/out/packager.js — _nodeModulesHandledExternally),
  // which produces an asar with zero node_modules.
  return true;
}
