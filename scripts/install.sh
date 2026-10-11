#!/bin/sh
# Arroxy Linux installer.
#
#   curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
#   wget -qO- https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
#
# Options go after `sh -s --`, needed because the script arrives on stdin:
#   curl -fsSL <url> | sh -s -- --flatpak      install the Flatpak instead
#   curl -fsSL <url> | sh -s -- --uninstall    remove the AppImage install
#
# By default: downloads the latest AppImage, verifies it against the release's
# published SHA256SUMS, and adds a desktop entry so Arroxy shows up in the
# applications menu. Everything lands under $HOME — no sudo, no system paths.
#
# --flatpak: installs Flatpak itself if it is missing (the one step that needs
# sudo), then installs Arroxy for the current user from Arroxy's own Flatpak
# repo, so `flatpak update` and GNOME Software keep it current. Flatpak checks
# the repo's GPG signature on every install and update. A copy installed from an
# older .flatpak bundle (no update source) is replaced; its settings stay.
#
# POSIX sh on purpose: this is piped into `sh`, so bashisms would break on
# dash/ash. Nothing here may read stdin — stdin is the script itself.

set -eu

REPO="antonio-orionus/Arroxy"
RAW="https://raw.githubusercontent.com/${REPO}/main"
LATEST="https://github.com/${REPO}/releases/latest/download"
APPIMAGE="Arroxy-linux-x64.AppImage"

DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
APP_DIR="$DATA_HOME/arroxy"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$DATA_HOME/applications"
ICON_DIR="$DATA_HOME/icons/hicolor/256x256/apps"

die() { printf '\033[31merror:\033[0m %s\n' "$*" >&2; exit 1; }
info() { printf '\033[36m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[33mwarning:\033[0m %s\n' "$*" >&2; }

uninstall() {
  info "Removing Arroxy"
  rm -rf "$APP_DIR"
  rm -f "$BIN_DIR/arroxy" \
        "$DESKTOP_DIR/arroxy.desktop" \
        "$ICON_DIR/arroxy.png"
  if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
  fi
  info "Done. Your downloads and settings in ~/.config/Arroxy were left alone."
  exit 0
}

mode=appimage
case "${1:-}" in
  "") ;;
  --uninstall) uninstall ;;
  --flatpak) mode=flatpak ;;
  *) die "Unknown option: $1 (expected --flatpak or --uninstall)" ;;
esac

# --- environment checks ------------------------------------------------------

os="$(uname -s)"
case "$os" in
  Linux) ;;
  Darwin)
    die "This script is for Linux. On macOS install with:
    brew install --cask antonio-orionus/arroxy/arroxy" ;;
  *) die "Unsupported OS: $os" ;;
esac

# ARROXY_FLATPAKREF points --flatpak at another repo; the test VM uses it for a
# local arm64 repo, which is also why it lifts the x86_64-only check.
FLATPAK_ID="io.github.antonio_orionus.Arroxy"
FLATPAKREF="${ARROXY_FLATPAKREF:-https://antonio-orionus.github.io/Arroxy/flatpak/${FLATPAK_ID}.flatpakref}"
FLATPAK_REPO_URL="${FLATPAKREF%/*}/repo/"

arch="$(uname -m)"
case "$arch" in
  x86_64|amd64) ;;
  aarch64|arm64)
    if [ "$mode" = appimage ] || [ -z "${ARROXY_FLATPAKREF:-}" ]; then
      die "Arroxy publishes x86_64 Linux builds only, and this machine is $arch.
    An x86_64 build cannot run here, so nothing was installed.
    Track ARM64 support: https://github.com/${REPO}/issues"
    fi ;;
  *) die "Unsupported architecture: $arch (x86_64 only)" ;;
esac

# One of curl/wget is enough; distros ship one or the other (fresh Ubuntu, for
# instance, has wget but no curl). Missing both only fails once a download is
# actually needed.
if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1" -o "$2"; }
  fetch_out() { curl -fsSL "$1"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO "$2" "$1"; }
  fetch_out() { wget -qO- "$1"; }
else
  fetch() { die "Need curl or wget to download. Install either, then re-run."; }
  fetch_out() { fetch "$@"; }
fi

# --- --flatpak ---------------------------------------------------------------

as_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
  elif command -v sudo >/dev/null 2>&1; then
    sudo "$@"
  else
    die "Installing Flatpak needs root, and sudo is not available. Install Flatpak (https://flatpak.org/setup/), then re-run."
  fi
}

install_flatpak() {
  fresh_flatpak=0
  if ! command -v flatpak >/dev/null 2>&1; then
    info "Flatpak is not installed; installing it (sudo may ask for your password)"
    # sudo reads the password from the terminal, not stdin, so the piped
    # script stays intact; DEBIAN_FRONTEND keeps debconf from prompting.
    if command -v apt-get >/dev/null 2>&1; then
      as_root apt-get update -qq
      as_root env DEBIAN_FRONTEND=noninteractive apt-get install -y -qq flatpak
    elif command -v dnf >/dev/null 2>&1; then
      as_root dnf install -y flatpak
    elif command -v pacman >/dev/null 2>&1; then
      as_root pacman -S --needed --noconfirm flatpak
    elif command -v zypper >/dev/null 2>&1; then
      as_root zypper --non-interactive install flatpak
    else
      die "No apt, dnf, pacman or zypper found. Install Flatpak (https://flatpak.org/setup/), then re-run."
    fi
    command -v flatpak >/dev/null 2>&1 || die "Flatpak still is not available after installing it."
    fresh_flatpak=1
  fi

  # This installs for the current user; a system-wide copy would make two.
  if flatpak info --system "$FLATPAK_ID" >/dev/null 2>&1; then
    die "Arroxy is already installed system-wide. Installing it for your user too would leave two copies.
    Remove the system copy first (your settings stay), then re-run:
      sudo flatpak uninstall --system $FLATPAK_ID"
  fi

  if flatpak info --user "$FLATPAK_ID" >/dev/null 2>&1; then
    origin="$(flatpak info --user --show-origin "$FLATPAK_ID")"
    origin_url="$(flatpak remotes --user --columns=name,url | awk -v r="$origin" '$1 == r {print $2}')"
    if [ "$origin_url" = "$FLATPAK_REPO_URL" ]; then
      info "Arroxy is already installed from its Flatpak repo; updating it"
      flatpak update --user --noninteractive -y "$FLATPAK_ID"
      info "Done. From now on: flatpak update (or GNOME Software)."
      exit 0
    fi
    # A copy from an older .flatpak bundle has an origin remote with no URL
    # and no key, so it never updates, and Flatpak refuses to install over it
    # ("already installed", even with --reinstall). Pointing that remote at
    # the repo moves it in place: nothing is removed first, so a failed
    # download leaves the current copy working, and a re-run picks up here.
    info "Moving the copy from an older .flatpak onto Arroxy's Flatpak repo (nothing is removed)"
    key="$(fetch_out "${FLATPAKREF%/*}/arroxy.flatpakrepo" | sed -n 's/^GPGKey=//p')" || key=""
    [ -n "$key" ] || die "Could not read the repo's signing key. Your current Arroxy is untouched; check your connection and re-run."
    printf '%s' "$key" | base64 -d | flatpak remote-modify --user --url="$FLATPAK_REPO_URL" --gpg-import=- --gpg-verify --enable "$origin" \
      || die "Could not point the existing copy at the repo. Your current Arroxy is untouched."
    flatpak update --user --noninteractive -y "$FLATPAK_ID" \
      || die "The update from the repo failed. Your current Arroxy still works; re-run to try again."
    info "Done. Your settings stayed, and from now on: flatpak update (or GNOME Software)."
    exit 0
  fi

  info "Installing Arroxy from its Flatpak repo"
  # The .flatpakref names Flathub as the runtime source; Flatpak adds it if
  # it is missing.
  flatpak install --user --noninteractive -y "$FLATPAKREF" \
    || die "Flatpak install failed. Check your connection and re-run, or install the .flatpak from:
    https://github.com/${REPO}/releases/latest"

  info "Arroxy installed. It updates with: flatpak update (or GNOME Software)"
  if [ "$fresh_flatpak" -eq 1 ]; then
    warn "Flatpak was just installed: log out and back in for Arroxy to appear in your applications menu.
    Until then, start it with:  flatpak run $FLATPAK_ID"
  else
    info "Launch it from your applications menu, or run: flatpak run $FLATPAK_ID"
  fi
  exit 0
}

[ "$mode" = flatpak ] && install_flatpak

if command -v sha256sum >/dev/null 2>&1; then
  sha256_of() { sha256sum "$1" | cut -d' ' -f1; }
elif command -v shasum >/dev/null 2>&1; then
  sha256_of() { shasum -a 256 "$1" | cut -d' ' -f1; }
else
  die "Need sha256sum or shasum to verify the download."
fi

# --- download + verify -------------------------------------------------------

tmp="$(mktemp -d)"
# shellcheck disable=SC2064  # $tmp must expand now, not at trap time
trap "rm -rf '$tmp'" EXIT INT TERM

info "Downloading $APPIMAGE"
fetch "$LATEST/$APPIMAGE" "$tmp/$APPIMAGE" \
  || die "Download failed. Check your connection or grab it manually:
    https://github.com/${REPO}/releases/latest"

info "Verifying checksum"
fetch "$LATEST/SHA256SUMS" "$tmp/SHA256SUMS" \
  || die "Could not download SHA256SUMS; refusing to install unverified."

expected="$(grep " $APPIMAGE\$" "$tmp/SHA256SUMS" | cut -d' ' -f1)"
[ -n "$expected" ] || die "$APPIMAGE is not listed in SHA256SUMS."

actual="$(sha256_of "$tmp/$APPIMAGE")"
if [ "$expected" != "$actual" ]; then
  die "Checksum mismatch — the download is corrupt or tampered with.
    expected: $expected
    actual:   $actual
    Nothing was installed."
fi
info "Checksum OK"

# --- install -----------------------------------------------------------------

mkdir -p "$APP_DIR" "$BIN_DIR" "$DESKTOP_DIR" "$ICON_DIR"
mv "$tmp/$APPIMAGE" "$APP_DIR/Arroxy.AppImage"
chmod +x "$APP_DIR/Arroxy.AppImage"
ln -sf "$APP_DIR/Arroxy.AppImage" "$BIN_DIR/arroxy"

# Non-fatal: a missing icon costs a menu picture, not a working app.
if fetch "$RAW/flatpak/icons/256x256.png" "$tmp/icon.png" 2>/dev/null; then
  mv "$tmp/icon.png" "$ICON_DIR/arroxy.png"
else
  warn "Could not fetch the icon; the menu entry will use a generic one."
fi

cat > "$DESKTOP_DIR/arroxy.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=Arroxy
Comment=YouTube downloader for video, audio, and subtitles
Exec=$APP_DIR/Arroxy.AppImage %U
Icon=arroxy
Categories=Network;AudioVideo;
Keywords=youtube;video;download;dlp;yt-dlp;media;mp4;mkv;subtitle;
Terminal=false
EOF

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

info "Arroxy installed to $APP_DIR"

# AppImages mount themselves through FUSE. fuse3 is enough (verified against
# this AppImage's runtime) and ships by default on current desktop distros, so
# this only fires on minimal installs, containers and some WSL setups. Warn
# rather than fail: the install is fine, only the launch would break.
if ! command -v fusermount3 >/dev/null 2>&1 && ! command -v fusermount >/dev/null 2>&1; then
  warn "No FUSE found, so the AppImage cannot mount itself at launch.
    Install it:  sudo apt install fuse3   (Debian/Ubuntu)
                 sudo dnf install fuse3   (Fedora)
                 sudo pacman -S fuse3     (Arch)
    Or run without mounting:  $APP_DIR/Arroxy.AppImage --appimage-extract-and-run"
fi

case ":${PATH}:" in
  *":$BIN_DIR:"*) ;;
  *) warn "$BIN_DIR is not in your PATH — the \`arroxy\` command will not resolve.
    Add it with:  echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.profile" ;;
esac

info "Launch it from your applications menu, or run: arroxy"
