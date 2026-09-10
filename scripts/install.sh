#!/bin/sh
# Arroxy Linux installer.
#
#   curl -fsSL https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
#   wget -qO- https://raw.githubusercontent.com/antonio-orionus/Arroxy/main/scripts/install.sh | sh
#
# Uninstall (note the `-s --`, needed because the script arrives on stdin):
#   curl -fsSL <url> | sh -s -- --uninstall
#
# Downloads the latest AppImage, verifies it against the release's published
# SHA256SUMS, and adds a desktop entry so Arroxy shows up in the applications
# menu. Everything lands under $HOME — no sudo, no system paths.
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

[ "${1:-}" = "--uninstall" ] && uninstall

# --- environment checks ------------------------------------------------------

os="$(uname -s)"
case "$os" in
  Linux) ;;
  Darwin)
    die "This script is for Linux. On macOS install with:
    brew install --cask antonio-orionus/arroxy/arroxy" ;;
  *) die "Unsupported OS: $os" ;;
esac

arch="$(uname -m)"
case "$arch" in
  x86_64|amd64) ;;
  aarch64|arm64)
    die "Arroxy publishes x86_64 Linux builds only, and this machine is $arch.
    An x86_64 AppImage cannot run here, so nothing was installed.
    Track ARM64 support: https://github.com/${REPO}/issues" ;;
  *) die "Unsupported architecture: $arch (x86_64 only)" ;;
esac

# One of curl/wget is enough; distros ship one or the other (fresh Ubuntu, for
# instance, has wget but no curl).
if command -v curl >/dev/null 2>&1; then
  fetch() { curl -fsSL "$1" -o "$2"; }
elif command -v wget >/dev/null 2>&1; then
  fetch() { wget -qO "$2" "$1"; }
else
  die "Need curl or wget to download. Install either, then re-run."
fi

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
