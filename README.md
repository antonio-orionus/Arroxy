# yt-dlp message catalogue

Written by `.github/workflows/ytdlp-catalogue.yml` on Arroxy's `main`; never edit by hand.

- `ytdlp-catalogue.json`: every message site in the yt-dlp commit the runtime manifest pins, with its labels and the rule behind each (one site per line).
- `coverage/<version>.md`: what is labelled, what changed since the previous pin, and what drifts.

One commit per pin (and one per generator change on main, with a report of its own), so `git log -p` is the history of yt-dlp's messages. Labels change on `main` (`scripts/ytdlp-catalogue/`), never here.
