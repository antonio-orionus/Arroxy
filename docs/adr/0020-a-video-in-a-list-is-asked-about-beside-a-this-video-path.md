# A video in a list is asked about only beside a no-question This video path

Supersedes the Radio half of [ADR 0007](0007-a-hotkey-press-never-asks.md). Its hotkey half stands.

A YouTube link that carries both `v=` and `list=` names one video and a list. ADR 0007 treated a Mix (`list=RD…`, or any link with `start_radio`) as a plain video everywhere: YouTube generates it around the video and changes it every session, so "the playlist" seemed to name nothing. That left two things unreachable from a video link: the Mix itself, and a YouTube Music playlist (`RDCLAK…`), which shares the `RD` prefix but is a stable list.

A Mix reads to a finite end (yt-dlp stops once videos repeat), so "the first N" is well defined. It is a snapshot, not nothing. So a Mix is now one of the lists a video link can name, and `RDCLAK…` reads as a playlist.

Making more links ambiguous only works if asking costs nothing to people who want the video. So the question is asked only where someone can answer it, and always beside a way not to be asked:

- **Every surface with a window offers This video** next to the list's button: the Explore toolbar, the URL tab, Explore's link menu. It downloads the video at once with the active profile.
- **The list's button asks about the list:** in the background (asking past the load limit), exactly the first N, or Interactive's picker. Interactive asks how many to load. Each also offers Just this video (the list's dialog first, Interactive's in its footer): people used to the old dialog look for the video there, not beside the button.
- **The hotkey still takes the video** (ADR 0007's hotkey half), and a Mix link is no exception.
- **Bulk URLs asks on the link's own row** (#581): in a Quick Download, a link naming a video and a list becomes a Needs your choice row that asks before anything loads: This video, the list in the background, or Pick from it. The rest of the batch downloads; the batch never waits on it.
- **Bulk URLs keeps every former Radio link** (`RD…`, `RDCLAK…`, `start_radio`) as one video, as before; a video in any other list asks on its row.

## Consequences

A Mix never costs more moves than before: on a Mix link, This video is the same one move Download used to be. Only Bulk URLs carries its own reading of `RD` links. It now has a per-link answer, the asking row, and keeps that reading all the same (the #581 decision).

The list kind (playlist, Mix, album, uploads, Watch later, liked) is read from the link alone and names every list control, so a mislabel is a lookup fix, not a flow change.
