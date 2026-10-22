"""What yt-dlp knows about YouTube links, for the YouTube URL contract.

Runs yt-dlp in-process (its release zipapp on sys.path, the first argument) and
writes JSON on stdout:

- urls: every URL in the test cases of yt-dlp's YouTube extractors, with the
  extractor yt-dlp hands it to. That extractor decides what --no-playlist and
  --yes-playlist can do with the link.
- shapes: a video id and a list id in each address shape a YouTube video can be
  shared in, with the extractor that claims each.
- listIds: the list id prefixes and exact ids yt-dlp's YouTube extractors accept
  (_PLAYLIST_ID_RE).

Nothing is downloaded and nothing touches the network.
"""

import inspect
import json
import re
import sys

VIDEO = 'dQw4w9WgXcQ'
LIST = 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'
SHAPES = [
    f'https://www.youtube.com/watch?v={VIDEO}&list={LIST}',
    f'https://www.youtube.com/watch?list={LIST}&v={VIDEO}',
    f'https://m.youtube.com/watch?v={VIDEO}&list={LIST}',
    f'https://music.youtube.com/watch?v={VIDEO}&list={LIST}',
    f'https://youtu.be/{VIDEO}?list={LIST}',
    f'https://www.youtube.com/shorts/{VIDEO}?list={LIST}',
    f'https://www.youtube.com/live/{VIDEO}?list={LIST}',
    f'https://www.youtube.com/embed/{VIDEO}?list={LIST}',
    f'https://www.youtube.com/v/{VIDEO}?list={LIST}',
    f'https://www.youtube.com/e/{VIDEO}?list={LIST}',
    f'https://www.youtube-nocookie.com/embed/{VIDEO}?list={LIST}',
    f'https://www.youtube.com/clip/UgkxU2HSeGL_NvmDJ-nQJrlLwllwMDBdGZFs?list={LIST}',
    f'https://www.youtube.com/playlist?list={LIST}&v={VIDEO}',
    f'https://www.youtube.com/embed/videoseries?list={LIST}',
    f'https://www.youtube.com/playlist?list={LIST}',
    f'https://www.youtube.com/watch?v={VIDEO}',
]


def list_ids(pattern):
    """Split _PLAYLIST_ID_RE into the prefixes (followed by an id) and exact ids."""
    prefixed = re.search(r'\(\?:\(\?:([^)]*)\)\[', pattern)
    exact = pattern[prefixed.end():] if prefixed else pattern
    return {
        'pattern': pattern,
        'prefixes': sorted(prefixed.group(1).split('|')) if prefixed else [],
        'exact': sorted(set(re.findall(r'\|([A-Z]+)(?=\||\)$)', exact))),
    }


def main():
    sys.path.insert(0, sys.argv[1])
    from yt_dlp.extractor import gen_extractor_classes
    import yt_dlp.extractor.youtube as youtube
    from yt_dlp.extractor.youtube._base import YoutubeBaseInfoExtractor

    extractors = list(gen_extractor_classes())

    def claim(url):
        return next((ie.ie_key() for ie in extractors if ie.suitable(url)), None)

    youtube_ies = [cls for _, cls in inspect.getmembers(youtube, inspect.isclass) if cls.__name__.startswith('Youtube') and cls.__name__.endswith('IE') and hasattr(cls, 'get_testcases')]
    urls = sorted({case['url'] for ie in youtube_ies for case in ie.get_testcases(include_onlymatching=True) if isinstance(case.get('url'), str) and case['url'].startswith('http')})
    json.dump({
        'urls': [{'url': url, 'extractor': claim(url)} for url in urls],
        'shapes': [{'url': url, 'extractor': claim(url)} for url in SHAPES],
        'listIds': list_ids(YoutubeBaseInfoExtractor._PLAYLIST_ID_RE),
    }, sys.stdout, indent=1, ensure_ascii=False)


if __name__ == '__main__':
    main()
