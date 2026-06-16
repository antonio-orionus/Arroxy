# Subtitles are fetched in a separate, soft phase

Subtitles are downloaded only after the media has been fetched successfully, as
a distinct second phase — never in the same pass as the video and audio. If that
subtitle phase fails, the failure is **soft**: the job still finalizes as
complete and the downloaded video is kept.

We chose this over a single combined pass because subtitle availability is far
less reliable than media availability (missing tracks, live-translation rate
limits), and a user who asked for a video plus subtitles is better served by the
video alone than by a hard failure that discards everything already downloaded.

## Consequences

Embedding subtitles into the file still runs through this same second phase —
the subtitles are fetched, then muxed into the saved video — so the soft-failure
guarantee holds whether the user picked sidecar or embedded subtitles.
