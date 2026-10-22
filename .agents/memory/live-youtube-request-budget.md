---
name: live-youtube-request-budget
description: Live YouTube checks run from Antonio's own network; a few dozen fresh-profile page loads in an hour got its IP a 429 and Google's "unusual traffic" captcha. Budget live loads before any repeated run.
metadata:
  type: feedback
---

On 2026-10-22 an ad-blocking spike loaded one YouTube playlist about 40 times in an hour, each in a fresh signed-out Electron partition, in batches of 3 to 11 runs. YouTube then answered every load with HTTP 429 and `google.com/sorry` ("Our systems have detected unusual traffic from your computer network"), which also hits Antonio's own browsing and yt-dlp downloads from that IP until it clears.

**Why:** a fresh, cookie-less profile hitting the same watch page over and over is what YouTube's bot detection looks for, and the agent's machine is Antonio's network: there is no throwaway IP.

**How to apply:** before any live YouTube check, write down how many page loads it will make in total and keep it to a handful (three is usually enough to see a pattern). Use one persistent partition rather than a new one per run, space runs out, and stop at the first sign of a captcha, 429 or `google.com/sorry`, rather than rerunning. Prefer the Fixture Product E2E or saved responses for anything that needs many repetitions, and ask Antonio before a batch. The live drift smoke stays tiny for the same reason. Related: [[macos-ffmpeg-cannot-verify-https]].
