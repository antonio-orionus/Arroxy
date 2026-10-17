---
name: macos-ffmpeg-cannot-verify-https
description: The embedded macOS ffmpeg is a static OpenSSL build with a dead CA path, so any HTTPS URL ffmpeg opens itself fails; the fixture E2E uses plain HTTP and cannot see it.
metadata:
  type: project
---

On 2026-10-17 a real YouTube part download failed with `tls @ ...: certificate verify failed` from the embedded macOS ffmpeg (Martin Riedl build, `--enable-openssl`). Any yt-dlp path that makes ffmpeg open the media URL (`--download-sections`, HLS via ffmpeg) hits it. Fixed by setting `SSL_CERT_FILE=/etc/ssl/cert.pem` on macOS in `withCaBundle` (`src/main/utils/process.ts`). Windows (Schannel) and Linux (OpenSSL, distro bundle) were checked on the VMs and are fine.

**Why:** the Fixture Product E2E serves media over `http://127.0.0.1`, so it never exercises TLS; a green E2E said nothing about this.

**How to apply:** when a change makes ffmpeg fetch a URL, run one live smoke against a short public video (`jNQXAC9IVRw`) on macOS before calling it done. Related: [[download-workflow-map]].
