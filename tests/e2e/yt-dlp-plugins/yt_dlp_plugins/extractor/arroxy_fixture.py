import json
import os
from pathlib import Path
import re
import urllib.request

from yt_dlp.extractor.youtube import YoutubeIE, YoutubeTabIE
from yt_dlp.utils import ExtractorError


def _fixture_catalog_path():
    configured = os.environ.get('ARROXY_E2E_FIXTURE_CATALOG_PATH')
    if configured:
        return Path(configured)
    return Path(__file__).resolve().parents[3] / 'fixture-media-catalog.json'


def _fixture_catalog():
    try:
        with _fixture_catalog_path().open('r', encoding='utf-8') as handle:
            return json.load(handle)
    except Exception as err:
        raise ExtractorError(f'Could not load Arroxy fixture media catalog: {err}')


def _fixture_playlist_id_pattern():
    return re.escape(_fixture_catalog()['playlist']['id'])


def _fixture_video(catalog, video_id):
    for video in catalog['videos']:
        if video['id'] == video_id:
            return video
    raise ExtractorError(f'Unknown Arroxy fixture video id: {video_id}')


def _fixture_title(catalog, video_id):
    return f"Fixture Video {_fixture_video(catalog, video_id)['number']}"


def _fixture_formats(catalog, base_url, video_id):
    video = _fixture_video(catalog, video_id)
    formats = []
    for descriptor in catalog['formatSets'][video['formatSet']]:
        entry = {
            'format_id': descriptor['id'],
            'format_note': descriptor['note'],
            'url': f"{base_url}/media/{video_id}/{descriptor['id']}.{descriptor['ext']}",
            'ext': descriptor['ext'],
            'protocol': 'http',
            'filesize': descriptor['filesize'],
            'vcodec': descriptor['vcodec'],
            'acodec': descriptor['acodec'],
        }
        for key in ('width', 'height', 'fps', 'tbr', 'abr'):
            if key in descriptor:
                entry[key] = descriptor[key]
        formats.append(entry)
    return formats


class ArroxyFixtureYoutubeIE(YoutubeIE, plugin_name='arroxyfixture'):
    _VALID_URL = r'https?://(?:www\.)?youtube\.com/watch\?(?:[^#]+&)?v=(?P<id>ARX[0-9A-Z]{8})(?:[&#].*)?$'

    def _fixture_base_url(self):
        base_url = os.environ.get('ARROXY_E2E_FIXTURE_BASE_URL')
        if not base_url:
            raise ExtractorError('ARROXY_E2E_FIXTURE_BASE_URL is required for Arroxy fixture extraction')
        return base_url.rstrip('/')

    def _notify_fixture_probe(self, base_url, video_id):
        try:
            request = urllib.request.Request(f'{base_url}/probe/{video_id}', headers={'User-Agent': 'arroxy-fixture-e2e'})
            with urllib.request.urlopen(request, timeout=60):
                return
        except Exception as err:
            raise ExtractorError(f'Fixture metadata failed for {video_id}: {err}')

    def _real_extract(self, url):
        video_id = self._match_id(url)
        catalog = _fixture_catalog()
        _fixture_video(catalog, video_id)
        base_url = self._fixture_base_url()
        self._notify_fixture_probe(base_url, video_id)
        title = _fixture_title(catalog, video_id)

        return {
            'id': video_id,
            'title': title,
            'description': f'Deterministic Arroxy E2E fixture for {video_id}',
            'duration': 42,
            'uploader': 'Arroxy Fixtures',
            'channel': 'Arroxy Fixtures',
            'webpage_url': url,
            'thumbnail': f'{base_url}/thumbnails/{video_id}.jpg',
            'thumbnails': [
                {
                    'id': 'fixture',
                    'url': f'{base_url}/thumbnails/{video_id}.jpg',
                    'width': 320,
                    'height': 180,
                },
            ],
            'subtitles': {
                'en': [
                    {
                        'url': f'{base_url}/subtitles/{video_id}/en.vtt',
                        'ext': 'vtt',
                        'name': 'English',
                    },
                ],
            },
            'automatic_captions': {},
            'formats': _fixture_formats(catalog, base_url, video_id),
        }


class ArroxyFixtureYoutubeTabIE(YoutubeTabIE, plugin_name='arroxyfixture'):
    _VALID_URL = rf'https?://(?:www\.)?youtube\.com/playlist\?list=(?P<id>{_fixture_playlist_id_pattern()})(?:[&#].*)?$'

    def _real_extract(self, url):
        playlist_id = self._match_id(url)
        catalog = _fixture_catalog()
        playlist = catalog['playlist']
        if playlist_id != playlist['id']:
            raise ExtractorError(f'Unknown Arroxy fixture playlist id: {playlist_id}')
        base_url = os.environ.get('ARROXY_E2E_FIXTURE_BASE_URL', '').rstrip('/')
        if not base_url:
            raise ExtractorError('ARROXY_E2E_FIXTURE_BASE_URL is required for Arroxy fixture extraction')

        entries = []
        for index, video_id in enumerate(playlist['videoIds'], start=1):
            entries.append({
                '_type': 'url',
                'ie_key': 'Youtube',
                'id': video_id,
                'title': _fixture_title(catalog, video_id),
                'url': f'https://www.youtube.com/watch?v={video_id}',
                'webpage_url': f'https://www.youtube.com/watch?v={video_id}',
                'thumbnail': f'{base_url}/thumbnails/{video_id}.jpg',
                'duration': 42,
                'playlist_index': index,
            })

        return {
            '_type': 'playlist',
            'id': playlist_id,
            'title': playlist['title'],
            'playlist_id': playlist_id,
            'playlist_title': playlist['title'],
            'webpage_url': url,
            'entries': entries,
        }
