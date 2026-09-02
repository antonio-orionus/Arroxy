# A hotkey press never asks which half of a URL you meant

A YouTube URL carrying both `v=` and `list=` names one video and a playlist at
once. In the app, Arroxy asks which one the user meant. A global-hotkey press
has no window to ask in, so it resolves the ambiguity itself: it downloads the
video.

Two separate rules produce that, and only one of them is a judgment call.

A radio list (`list=RD…`, or any list reached via `start_radio`) is not
ambiguous at all. YouTube generates it around the video, personalises it, and
gives it different membership every session, so "download the playlist" names
nothing stable — the `v=` is the only thing the URL addresses. Radio therefore
reads as a plain single video in every surface, hotkey or not, and the mixed
prompt never sees it. Nothing visible to a human distinguishes a radio link
from a video link: not the URL as YouTube renders it, not the copied text, not
the video card Arroxy draws from the probe. The ambiguity is ours to resolve
because it was never the user's to notice.

A real playlist (`list=PL…`) is genuinely ambiguous, and there the hotkey
still picks the video. The alternative is not "download the playlist" — it is
`needs-review`, a notification asking the user to open the app and answer a
question. That defeats the point of a hotkey, which exists so a download can
start without going near the app. Between silently queueing two hundred items
and queueing the one video whose id is in the URL, the video is the cheaper
wrong answer: it is visible in Downloads immediately, cancellable, and costs
one file. The interactive paths keep the prompt; only the hotkey decides.

## Consequences

The routing rule lives in one place, read by both callers at different entry
points. The hotkey previously carried its own copy of the intent-to-probe-mode
mapping plus its own mixed-intent rule; both are gone. A new entry point that
wants different behaviour for ambiguous URLs adds a branch there rather than a
second table.

The playlist half of this is the reversible half, and is expected to be
revisited on public feedback. Users who hotkey a playlist link expecting the
playlist will report a bug that reads as "it only downloaded one video". If
that arrives more than isolated times, drop the `hotkey` branch in
`policyForUrlIntent` and mixed URLs go back to `needs-review` — a two-line
change. Radio is unaffected by that reversal, because it is fixed in the
classifier and not in the policy.

The radio half is not similarly negotiable. Reverting it would restore a
prompt that offers a choice with no stable answer behind it.
