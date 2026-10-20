#!/usr/bin/env bash
# Turns the OSTree repo flatpak-builder produced into Arroxy's published Flatpak
# repo, and builds the downloadable bundle that points at it. The release
# workflow runs this; scripts/vm/ubu-flatpak-repo-test.sh runs the same script
# on the test VM, so the published layout is exercised before a release.
#
# Users install once from the .flatpakref (or the bundle), which adds Arroxy's
# repo as a Flatpak remote; from then on `flatpak update` and GNOME Software
# keep Arroxy current, like a Scoop bucket or Homebrew tap does elsewhere.
#
# Usage:
#   scripts/flatpak/publish-repo.sh --repo DIR --site DIR --url URL --gpg-key ID \
#       [--gpg-homedir DIR] [--bundle FILE] [--no-bundle-remote] [--arch ARCH]
#
#   --repo DIR          OSTree repo from flatpak-builder --repo (signed in place)
#   --site DIR          output: static files to host at URL
#   --url URL           where the site is served, e.g. https://antonio-orionus.github.io/Arroxy/flatpak
#   --gpg-key ID        key that signs commits and the repo summary
#   --gpg-homedir DIR   GnuPG home holding that key (default: gpg's own)
#   --bundle FILE       also write a single-file bundle
#   --no-bundle-remote  leave the remote out of the bundle (prerelease builds:
#                       the repo carries stable releases only)
#   --arch ARCH         Flatpak arch of the build (default: x86_64)
set -euo pipefail

APP_ID=io.github.antonio_orionus.Arroxy
BRANCH=master
FLATHUB_REPO=https://dl.flathub.org/repo/flathub.flatpakrepo

repo='' site='' url='' key='' homedir='' bundle='' bundle_remote=1 arch=x86_64
while (($#)); do
	case "$1" in
		--repo) repo="$2"; shift ;;
		--site) site="$2"; shift ;;
		--url) url="${2%/}"; shift ;;
		--gpg-key) key="$2"; shift ;;
		--gpg-homedir) homedir="$2"; shift ;;
		--bundle) bundle="$2"; shift ;;
		--no-bundle-remote) bundle_remote=0 ;;
		--arch) arch="$2"; shift ;;
		*) echo "unknown option: $1" >&2; exit 2 ;;
	esac
	shift
done
for required in repo site url key; do
	[[ -n ${!required} ]] || { echo "--$required is required" >&2; exit 2; }
done
[[ -d $repo/objects ]] || { echo "$repo is not an OSTree repo" >&2; exit 1; }

# The site is rebuilt from scratch; never let that delete the repo itself.
# Checked before anything touches the repo.
repo_abs="$(cd "$repo" && pwd -P)"
mkdir -p "$site"
site_abs="$(cd "$site" && pwd -P)"
case "$repo_abs/" in
	"$site_abs"/*) echo "--site ($site_abs) must not contain --repo ($repo_abs)" >&2; exit 1 ;;
esac

gpg_args=(--gpg-sign="$key")
[[ -n $homedir ]] && gpg_args+=(--gpg-homedir="$homedir")
gpg_cmd=(gpg)
[[ -n $homedir ]] && gpg_cmd+=(--homedir "$homedir")

public_key="$(mktemp)"
trap 'rm -f "$public_key"' EXIT
"${gpg_cmd[@]}" --export "$key" >"$public_key"
[[ -s $public_key ]] || { echo "no public key for $key" >&2; exit 1; }
gpg_key_b64="$(base64 <"$public_key" | tr -d '\n')"

# Sign every app and runtime ref the build exported — the app and the
# .Debug extension flatpak-builder adds — so any of them installs from a
# GPG-verified remote. build-update-repo then signs the summary and the
# appstream refs GNOME Software reads.
signed=0
while read -r ref _; do
	IFS=/ read -r kind id ref_arch ref_branch <<<"$ref"
	case "$kind" in
		app) flatpak build-sign "${gpg_args[@]}" --arch="$ref_arch" "$repo" "$id" "$ref_branch" ;;
		runtime) flatpak build-sign "${gpg_args[@]}" --runtime --arch="$ref_arch" "$repo" "$id" "$ref_branch" ;;
		*) continue ;;
	esac
	signed=$((signed + 1))
done < <(flatpak repo --branches "$repo")
((signed)) || { echo "no app or runtime refs in $repo" >&2; exit 1; }
flatpak build-update-repo "${gpg_args[@]}" --title=Arroxy --default-branch="$BRANCH" --prune "$repo"

rm -rf "$site"
mkdir -p "$site"
cp -R "$repo" "$site/repo"

cat >"$site/arroxy.flatpakrepo" <<EOF
[Flatpak Repo]
Title=Arroxy
Url=$url/repo/
Homepage=https://arroxy.com/
Comment=Arroxy's own Flatpak repository
Description=Updates for the Arroxy Flatpak, published with every stable release.
GPGKey=$gpg_key_b64
EOF

cat >"$site/$APP_ID.flatpakref" <<EOF
[Flatpak Ref]
Title=Arroxy
Name=$APP_ID
Branch=$BRANCH
Url=$url/repo/
SuggestRemoteName=arroxy
Homepage=https://arroxy.com/
RuntimeRepo=$FLATHUB_REPO
IsRuntime=false
GPGKey=$gpg_key_b64
EOF

cat >"$site/index.html" <<EOF
<!doctype html>
<meta charset="utf-8">
<title>Arroxy Flatpak repository</title>
<h1>Arroxy Flatpak repository</h1>
<p>Install once, then <code>flatpak update</code> keeps Arroxy current:</p>
<pre>flatpak install --user $url/$APP_ID.flatpakref</pre>
<p><a href="$APP_ID.flatpakref">$APP_ID.flatpakref</a> · <a href="arroxy.flatpakrepo">arroxy.flatpakrepo</a> · <a href="https://arroxy.com/">arroxy.com</a></p>
EOF

if [[ -n $bundle ]]; then
	bundle_args=(--runtime-repo="$FLATHUB_REPO" --arch="$arch")
	# With a repo URL and key inside, installing the bundle also adds Arroxy's
	# repo as the app's origin, so `flatpak update` works afterwards.
	((bundle_remote)) && bundle_args+=(--repo-url="$url/repo/" --gpg-keys="$public_key")
	flatpak build-bundle "${bundle_args[@]}" "$repo" "$bundle" "$APP_ID" "$BRANCH"
fi

echo "site: $site ($(du -sh "$site" | cut -f1)) for $url"
[[ -n $bundle ]] && echo "bundle: $bundle ($(du -h "$bundle" | cut -f1))"
exit 0
