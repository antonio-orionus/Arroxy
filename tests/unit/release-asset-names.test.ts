import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

function read(path: string): string {
  return readFileSync(join(root, path), 'utf8');
}

describe('release asset names', () => {
  const stableAssets = ['Arroxy-win-x64-Setup.exe', 'Arroxy-win-x64-Portable.exe', 'Arroxy-mac-arm64.dmg', 'Arroxy-mac-x64.dmg', 'Arroxy-linux-x64.AppImage', 'Arroxy-linux-x64.tar.gz', 'Arroxy-linux-x64.flatpak'];

  it('configures electron-builder to publish stable platform-prefixed artifacts', () => {
    const config = read('electron-builder.json5');

    expect(config).toContain('"artifactName": "${productName}-win-${arch}-Setup.${ext}"');
    expect(config).toContain('"artifactName": "${productName}-win-${arch}-Portable.${ext}"');
    expect(config).toContain('"artifactName": "${productName}-mac-${arch}.${ext}"');
    expect(config).toContain('"artifactName": "${productName}-linux-${arch}.${ext}"');
    expect(config).not.toContain('"artifactName": "${productName}-Setup-${version}.${ext}"');
    expect(config).not.toContain('"artifactName": "${productName}-${version}.${ext}"');
  });

  it('keeps release workflow consumers on the same stable filenames', () => {
    const release = read('.github/workflows/release.yml');
    const installer = read('.github/workflows/installer-smoke.yml');
    const winget = read('.github/workflows/release_to_winget.yml');
    const flatpak = read('.github/workflows/flatpak.yml');

    for (const asset of stableAssets) {
      expect([release, installer, winget, flatpak].join('\n')).toContain(asset);
    }

    expect(winget).toContain("installers-regex: '^Arroxy-win-x64-Setup\\.exe$'");
    expect(release).not.toContain('Arroxy-Setup-${VERSION}.exe');
    expect(release).not.toContain('Arroxy-${VERSION}-arm64.dmg');
    expect(flatpak).not.toContain('Arroxy-${VERSION}.tar.gz');
  });

  it('documents evergreen direct download links in the README template', () => {
    const template = read('readme-src/template.md');

    expect(template).toContain('## <a id="install"></a>{{dl_h2}}');
    for (const asset of stableAssets) {
      expect(template).toContain(`https://github.com/antonio-orionus/Arroxy/releases/latest/download/${asset}`);
    }
    expect(template).toContain('https://github.com/antonio-orionus/Arroxy/releases/latest/download/SHA256SUMS');
  });

  it('does not document stale versioned Windows filename patterns in generated READMEs', () => {
    const readmes = readdirSync(root).filter((file) => /^README(?:\.[a-z]+)?\.md$/.test(file));

    for (const file of readmes) {
      const content = read(file);

      expect(content).not.toContain('Arroxy-Setup-*.exe');
      expect(content).not.toContain('Arroxy-Portable-*.exe');
    }
  });
});
