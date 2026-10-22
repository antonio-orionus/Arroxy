"""yt-dlp's own subtitle track choice for each case, for the selection parity check.

Reads {"videos": {id: info_dict}, "cases": [{"video", "argv"}]} as JSON on
stdin and writes, per case, the tracks yt-dlp would fetch as {key: url} (its
`requested_subtitles`), or {"error": message} when it refuses the case, as a
JSON list. The argv is the subtitle run's own: yt-dlp's option parser turns it
into the subtitle parameters (`--write-subs`, `--write-auto-subs`,
`--sub-langs`, `--sub-format`), and `process_ie_result`, the path
`--load-info-json` takes, picks the tracks. Runs yt-dlp in-process (its zipapp
on sys.path, the first argument), one worker per core. Nothing is downloaded.
"""

import copy
import json
import multiprocessing
import sys


_SUBTITLE_PARAMS = ('writesubtitles', 'writeautomaticsub', 'allsubtitles', 'subtitleslangs', 'subtitlesformat')

_videos = None


def _start_worker(zipapp, videos):
    global _videos
    sys.path.insert(0, zipapp)
    _videos = videos


def pick(case):
    from yt_dlp import YoutubeDL, parse_options
    try:
        # No user or system config may change what the argv asks for.
        parsed = parse_options(['--ignore-config', *case['argv']])
        params = {key: parsed.ydl_opts.get(key) for key in _SUBTITLE_PARAMS}
        with YoutubeDL({**params, 'quiet': True, 'no_warnings': True, 'simulate': True, 'noprogress': True}) as ydl:
            result = ydl.process_ie_result(copy.deepcopy(_videos[case['video']]), download=False)
    except BaseException as error:  # parse_options exits on a bad argv
        return {'error': f'{type(error).__name__}: {error}'}
    requested = result.get('requested_subtitles') or {}
    return {'tracks': {key: track.get('url') for key, track in requested.items()}}


def main():
    zipapp = sys.argv[1]
    request = json.load(sys.stdin)
    with multiprocessing.Pool(initializer=_start_worker, initargs=(zipapp, request['videos'])) as pool:
        json.dump(pool.map(pick, request['cases'], chunksize=16), sys.stdout)


if __name__ == '__main__':
    main()
