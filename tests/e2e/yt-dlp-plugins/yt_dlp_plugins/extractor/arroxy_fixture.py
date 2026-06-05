import os
import urllib.request

from yt_dlp.extractor.youtube import YoutubeIE, YoutubeTabIE
from yt_dlp.utils import ExtractorError

FIXTURE_PLAYLIST_ID = 'PLarroxyfixture'
FIXTURE_PLAYLIST_VIDEO_IDS = ['ARX00000001', 'ARX00000002', 'ARX00000003']


class ArroxyFixtureYoutubeIE(YoutubeIE, plugin_name='arroxyfixture'):
    _VALID_URL = r'https?://(?:www\.)?youtube\.com/watch\?(?:[^#]+&)?v=(?P<id>ARX[0-9A-Z]{8})(?:[&#].*)?$'

    @staticmethod
    def _fixture_title(video_id):
        suffix = video_id[-2:]
        try:
            number = int(suffix)
        except ValueError:
            number = 0
        return f'Fixture Video {number}'

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
        base_url = self._fixture_base_url()
        self._notify_fixture_probe(base_url, video_id)
        title = self._fixture_title(video_id)

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
            'formats': [
                {
                    'format_id': '18',
                    'format_note': '360p fixture mp4',
                    'url': f'{base_url}/media/{video_id}/18.mp4',
                    'ext': 'mp4',
                    'protocol': 'http',
                    'width': 640,
                    'height': 360,
                    'fps': 30,
                    'tbr': 800,
                    'filesize': 262144,
                    'vcodec': 'avc1.42001E',
                    'acodec': 'mp4a.40.2',
                },
                {
                    'format_id': '22',
                    'format_note': '720p fixture mp4',
                    'url': f'{base_url}/media/{video_id}/22.mp4',
                    'ext': 'mp4',
                    'protocol': 'http',
                    'width': 1280,
                    'height': 720,
                    'fps': 30,
                    'tbr': 1500,
                    'filesize': 524288,
                    'vcodec': 'avc1.64001F',
                    'acodec': 'mp4a.40.2',
                },
            ],
        }


class ArroxyFixtureYoutubeTabIE(YoutubeTabIE, plugin_name='arroxyfixture'):
    _VALID_URL = r'https?://(?:www\.)?youtube\.com/playlist\?list=(?P<id>PLarroxyfixture)(?:[&#].*)?$'

    def _real_extract(self, url):
        playlist_id = self._match_id(url)
        base_url = os.environ.get('ARROXY_E2E_FIXTURE_BASE_URL', '').rstrip('/')
        if not base_url:
            raise ExtractorError('ARROXY_E2E_FIXTURE_BASE_URL is required for Arroxy fixture extraction')

        entries = []
        for index, video_id in enumerate(FIXTURE_PLAYLIST_VIDEO_IDS, start=1):
            entries.append({
                '_type': 'url',
                'ie_key': 'Youtube',
                'id': video_id,
                'title': ArroxyFixtureYoutubeIE._fixture_title(video_id),
                'url': f'https://www.youtube.com/watch?v={video_id}',
                'webpage_url': f'https://www.youtube.com/watch?v={video_id}',
                'thumbnail': f'{base_url}/thumbnails/{video_id}.jpg',
                'duration': 42,
                'playlist_index': index,
            })

        return {
            '_type': 'playlist',
            'id': playlist_id,
            'title': 'Fixture Playlist',
            'playlist_id': playlist_id,
            'playlist_title': 'Fixture Playlist',
            'webpage_url': url,
            'entries': entries,
        }
