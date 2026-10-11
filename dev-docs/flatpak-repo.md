# Flatpak repo

Arroxy publishes its own Flatpak repository — the Flatpak counterpart of the Scoop bucket and Homebrew tap. A user installs once; from then on `flatpak update` and GNOME Software keep Arroxy current, and the in-app banner hands out `flatpak update io.github.antonio_orionus.Arroxy` when a release is out. Flathub is not used (it requires building from source and has its own AI-content policy).

| Lives in                                        | What                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `scripts/flatpak/publish-repo.sh`               | Signs the build, refreshes the repo, writes `.flatpakrepo` / `.flatpakref`, builds the bundle |
| `scripts/flatpak/create-signing-key.sh`         | One-time signing-key setup (secret + backup + committed public key)                    |
| `flatpak/repo-signing-key.asc`                  | Public half of the signing key; CI refuses any other key                               |
| `.github/workflows/release.yml`                 | `build-flatpak` (sign, site, bundle) and `publish-flatpak-repo` (Pages deploy)         |
| `src/main/ipc/registerUpdaterHandlers.ts`       | Update check for the Flatpak channel                                                   |
| `src/renderer/src/components/system/updateBannerAction.ts` | The `flatpak update` copy-command                                         |
| `scripts/vm/ubu-flatpak-repo-test.sh`           | End-to-end test on the Ubuntu VM (see [linux-vm-testing.md](linux-vm-testing.md))      |

## For users

One line, on any x86_64 distro:

```bash
curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh -s -- --flatpak
```

`scripts/install.sh --flatpak` installs Flatpak with the system package manager if it is missing (apt, dnf, pacman or zypper; the only `sudo` step), updates an install that already comes from the repo, moves a copy from an old bundle onto the repo in place (it gives that copy's dead origin remote the repo URL and key, then runs `flatpak update`; nothing is removed first, so a failed download leaves the old copy working), refuses to add a per-user copy next to a system-wide one, then installs from the `.flatpakref`. With Flatpak already present, the `.flatpakref` alone does the same job:

```bash
flatpak install --user https://antonio-orionus.github.io/Arroxy/flatpak/io.github.antonio_orionus.Arroxy.flatpakref
```

`scripts/vm/ubu-flatpak-repo-test.sh` runs the script piped into the guest's `sh` (dash) for a fresh install, a re-run and an old-bundle copy — including that copy surviving untouched when the repo is unreachable. The branch that installs Flatpak itself is not exercised there: the guest already has Flatpak, and its `sudo` needs a password.

Installing the `.flatpak` from a stable GitHub Release works too: the bundle carries the repo URL and key, so the install gets the repo as its origin and updates the same way. Prerelease bundles leave the repo out — the repo only carries stable releases, and `flatpak update` must not move a beta tester onto them.

Copies installed from a bundle before the repo existed (0.4.22 and earlier) have no update source, and contain no banner code. Installing over them fails with "already installed" (also with `--reinstall` and a `.flatpakref`, because the app belongs to the bundle's dead origin remote). Two ways move them onto the repo, both verified on the VM to keep one copy and the user's settings: `flatpak uninstall --user io.github.antonio_orionus.Arroxy` followed by the `.flatpakref` install (what the README says), or `flatpak install --user --reinstall` of a new stable bundle. After that, `flatpak update` works.

The `.flatpakref` install needs nothing else set up: on an installation with no remotes at all it adds Arroxy's repo and Flathub (for the runtime) by itself.

## How a release publishes it

1. `build-flatpak` builds with `flatpak-builder` into `repo/` (the action's own bundle and artifact are off).
2. It imports `FLATPAK_GPG_PRIVATE_KEY` and checks its fingerprint against `flatpak/repo-signing-key.asc`.
3. `publish-repo.sh` signs the app commit (`flatpak build-sign`), rebuilds and signs the summary and appstream data (`flatpak build-update-repo --prune`), copies the repo into `flatpak-site/flatpak/`, writes `arroxy.flatpakrepo`, `io.github.antonio_orionus.Arroxy.flatpakref` and an index page, and builds `arroxy.flatpak` with `--repo-url` and the key.
4. The bundle goes to the release as before (`upload-flatpak`); for stable tags the site is uploaded as the Pages artifact.
5. `publish-flatpak-repo` deploys it with `actions/deploy-pages` after `publish-release`, so the repo never announces a release before the GitHub Release is public.

The repo is rebuilt from scratch each release and holds only the latest commit. Installed copies still update: OSTree fetches the new commit's objects and reuses what is already on disk.

GitHub Pages is set to deploy from workflows, and the `github-pages` environment allows `v*` tags as well as `main` (tag-triggered releases are rejected otherwise). Pages' soft limits (1 GB site, about 100 GB a month) are far above Arroxy's Flatpak traffic; the repo can move to another static host behind the same URL scheme if that ever changes.

## The signing key

Created once with `scripts/flatpak/create-signing-key.sh`, run by a maintainer: RSA 4096 (verified by every Flatpak still in use, including old LTS releases), no passphrase (CI signs unattended). It sets the secret, writes a backup of the private key for a password manager, and writes the public key to commit.

**Never rotate it casually.** Every installed copy trusts the key it was installed with and rejects updates signed by any other, so a new key means every user reinstalls. The fingerprint check in `build-flatpak` stops an accidental swap of the secret.

## Testing

`scripts/vm/ubu-flatpak-build.sh` then `scripts/vm/ubu-flatpak-repo-test.sh` run the same `publish-repo.sh` on the Ubuntu ARM64 VM with a throwaway key and check, from Flatpak's own state: install from the `.flatpakref` and from the bundle each get the repo as origin with GPG verification on; a newly published commit arrives with `flatpak update <app>` (no `--user`, exactly the banner's command); and the installed Flatpak's banner shows that command when a newer release is announced.
