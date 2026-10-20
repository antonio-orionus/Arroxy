"""yt-dlp's own format pick for each case, for the selection parity check.

Reads {"probes": {id: info_dict}, "cases": [{"probe", "format", "sort"}]} as
JSON on stdin and writes, per case, the picked format_id and the extension yt-dlp
gives the result (its merger's container for a merge), or null when it picks
nothing, as a JSON list. Runs yt-dlp in-process (its zipapp on sys.path, the
first argument), one worker per core, so thousands of cases cost a few
interpreter starts. Each case goes through `process_ie_result`, the path
`--load-info-json` takes, so the extractor's `_format_sort_fields` and
yt-dlp's own field fixes apply as in a real run. Nothing is downloaded.
"""

import copy
import json
import multiprocessing
import sys


_ydl = None
_probes = None


def _start_worker(zipapp, probes):
    global _ydl, _probes
    sys.path.insert(0, zipapp)
    from yt_dlp import YoutubeDL
    _ydl = YoutubeDL({'quiet': True, 'no_warnings': True, 'simulate': True, 'noprogress': True})
    _probes = probes


def pick(case):
    # One YoutubeDL per worker. Its sorter reads `format_sort` on each call;
    # its selector is built once in __init__, so it is rebuilt here.
    _ydl.params['format'] = case['format']
    _ydl.params['format_sort'] = case['sort'].split(',') if case.get('sort') else []
    _ydl.format_selector = _ydl.build_format_selector(case['format'])
    try:
        result = _ydl.process_ie_result(copy.deepcopy(_probes[case['probe']]), download=False)
    except Exception:
        return None
    return {'id': result.get('format_id'), 'ext': result.get('ext')}


def main():
    zipapp = sys.argv[1]
    request = json.load(sys.stdin)
    with multiprocessing.Pool(initializer=_start_worker, initargs=(zipapp, request['probes'])) as pool:
        json.dump(pool.map(pick, request['cases'], chunksize=64), sys.stdout)


if __name__ == '__main__':
    main()
