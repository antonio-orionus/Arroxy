---
name: macos-26-electron-audio-service
description: macOS 26 with Electron 42 can crash-loop Chromium's out-of-process Audio Service during Arroxy dev startup
metadata:
  type: project
---

On macOS 26 / Darwin 25 with Electron 42.4.0, Arroxy dev startup can spam:

```text
Child process gone: type=Utility reason=crashed exitCode=6 name=Audio Service serviceName=audio.mojom.AudioService
```

This is Chromium's out-of-process `audio.mojom.AudioService`, not Arroxy's yt-dlp/ffmpeg audio pipeline. The crash loop can delay first startup and may coincide with macOS local-network/media permission prompts when Terminal launches the dev app.

The verified workaround is to apply Chromium switch `disable-features=AudioServiceOutOfProcess` before BrowserWindow creation. Arroxy now applies this automatically for Darwin major version `>=25` in `src/main/chromiumSwitches.ts`; the dev escape hatch `ARROXY_CHROMIUM_SWITCHES` can pass additional whitespace-separated Chromium switches.
