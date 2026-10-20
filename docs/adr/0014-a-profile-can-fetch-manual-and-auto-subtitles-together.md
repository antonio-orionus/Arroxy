# A profile can fetch manual and automatic subtitles together

The Format screen lets the user tick YouTube's uploaded English and its
automatic English caption side by side, and that download saves both. A
profile could not say so. It stores language codes and one subtitle source
(manual first, manual only, auto only), and every one of those keeps at most
one of the two tracks per language. Saving those picks as a profile wrote
`en` with manual first, so reapplying it silently dropped the caption.

We added a fourth source, **manual and auto**: for each language, the manual
tracks and the automatic caption are both picked. Saving picks that hold both
for one language writes this source; a profile saved without such a pair goes
back to manual first, so it never adds a caption the user left out.

Rejected:

- A per-language marker (a second list of "languages that also want the
  caption"). Exact, but a second language list in the editor for a case that,
  on YouTube, only ever applies to the spoken language, which is the one
  language that has a caption at all.
- Storing YouTube's `-orig` track keys as profile languages. A profile is
  meant for any site and any video; a track key from one site's naming is not
  a language.

## Consequences

The source is coarse on purpose: on YouTube it adds the spoken language's
caption whenever that language is in the profile, which is what the user
asked for. On sites whose probe does not list every track, and for a
playlist entry with no info-json, the language codes go to yt-dlp as a
pattern, and yt-dlp keeps one track per key (the manual one), so there
manual and auto behaves as manual first.

When both English tracks are fetched, the caption keeps its `en-orig` key so
its file and embedded track stay apart from the manual `en`. Embedding gives
it the language's code (`eng`, not the invalid `en-orig`) and the title
"Auto-generated". Everywhere else the caption goes by its bare key, whichever
path picked it.
