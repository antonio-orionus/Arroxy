import json
import os
from pathlib import Path
import re
import urllib.parse
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


def _fixture_playlists(catalog):
    return [catalog['playlist'], catalog['repeatedPlaylist'], catalog['overlapPlaylist']]


def _fixture_playlist_id_pattern():
    return '|'.join(re.escape(playlist['id']) for playlist in _fixture_playlists(_fixture_catalog()))


def _fixture_video(catalog, video_id):
    for video in catalog['videos']:
        if video['id'] == video_id:
            return video
    raise ExtractorError(f'Unknown Arroxy fixture video id: {video_id}')


def _fixture_title(catalog, video_id):
    # A catalog entry may override its title to exercise names the filesystem
    # makes hard: characters yt-dlp's sanitizer rewrites, multibyte text whose
    # byte and UTF-16 lengths differ, and lengths that force truncation.
    video = _fixture_video(catalog, video_id)
    return video.get('title') or f"Fixture Video {video['number']}"


def _parsed_extractor_args(extractor):
    # What yt-dlp parsed from --extractor-args, read the way the real YouTube
    # extractor reads it. Presence only for the token and visitor data: the
    # harness proves the options reached yt-dlp, never what they held.
    po_token = extractor._configuration_arg('po_token', ie_key='youtube', casesense=True)
    visitor_data = extractor._configuration_arg('visitor_data', ie_key='youtube', casesense=True)
    player_client = extractor._configuration_arg('player_client', None, ie_key='youtube')
    query = {'poToken': '1' if po_token else '0', 'visitorData': '1' if visitor_data else '0'}
    if player_client is not None:
        query['playerClient'] = ','.join(player_client)
    return query


def _notify_extraction(extractor, base_url, item_id, query):
    # Records the extraction with the fixture server and returns its scripted
    # step for this attempt, if any: warnings to print, or an error to raise.
    query = {**query, **_parsed_extractor_args(extractor)}
    try:
        request = urllib.request.Request(f'{base_url}/probe/{item_id}?{urllib.parse.urlencode(query)}', headers={'User-Agent': 'arroxy-fixture-e2e'})
        with urllib.request.urlopen(request, timeout=60) as response:
            body = response.read()
    except Exception as err:
        raise ExtractorError(f'Fixture metadata failed for {item_id}: {err}')
    step = json.loads(body) if body else {}
    for warning in step.get('warnings', []):
        extractor.report_warning(warning, item_id)
    if step.get('error'):
        raise ExtractorError(step['error'], video_id=item_id, expected=True)


def _session_limited(video, signed_in):
    # `limitedWithCookiesOnly` mimics an account YouTube limits while the same
    # video downloads at full quality signed out.
    return not video.get('limitedWithCookiesOnly') or signed_in


def _fixture_formats(catalog, base_url, video_id, signed_in):
    video = _fixture_video(catalog, video_id)
    # A catalog entry may withhold formats to mimic YouTube returning a format
    # list without usable URLs for them (e.g. SABR-limited sessions).
    withheld = set(video.get('withheldFormatIds', [])) if _session_limited(video, signed_in) else set()
    formats = []
    for descriptor in catalog['formatSets'][video['formatSet']]:
        if descriptor['id'] in withheld:
            continue
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

    def _explore_marker(self):
        # Only the seeded Explore session carries this cookie, so its presence
        # tells an Explore-signed-in extraction from an anonymous one.
        marker = self._get_cookies('https://www.youtube.com').get('ARROXY_FIXTURE_AUTH')
        return marker.value if marker else None

    def _cookie_domains(self):
        # Domains only, never values: lets the harness prove which cookies reached yt-dlp.
        return sorted({cookie.domain for cookie in self._downloader.cookiejar})

    def _notify_fixture_probe(self, base_url, video_id, signed_in, marker):
        query = {'domains': ','.join(self._cookie_domains())}
        if signed_in:
            query['signedIn'] = '1'
        if marker:
            query['marker'] = marker
        _notify_extraction(self, base_url, video_id, query)

    def _real_extract(self, url):
        video_id = self._match_id(url)
        catalog = _fixture_catalog()
        _fixture_video(catalog, video_id)
        base_url = self._fixture_base_url()
        params = self._downloader.params
        marker = self._explore_marker()
        signed_in = bool(marker) or bool(params.get('cookiefile') or params.get('cookiesfrombrowser'))
        # Recorded before the sign-in check so the harness also sees refused extractions.
        self._notify_fixture_probe(base_url, video_id, signed_in, marker)
        title = _fixture_title(catalog, video_id)
        video = _fixture_video(catalog, video_id)
        if video.get('requiresSignIn') and not marker:
            raise ExtractorError('Sign in to confirm your age. This video may be inappropriate for some users.', expected=True)
        # Catalog warnings are printed exactly as yt-dlp's YouTube extractor
        # would print them, so output parsers see a realistic line.
        if _session_limited(video, signed_in):
            for warning in video.get('warnings', []):
                self.report_warning(warning, video_id)

        info = {
            'id': video_id,
            'title': title,
            'description': f'Deterministic Arroxy E2E fixture for {video_id}',
            # A chaptered entry states its real length, so a part of it can be cut.
            'duration': video.get('duration', 42),
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
                'es': [
                    {
                        'url': f'{base_url}/subtitles/{video_id}/es.vtt',
                        'ext': 'vtt',
                        'name': 'Spanish',
                    },
                ],
            },
            'automatic_captions': {
                'en': [
                    {
                        'url': f'{base_url}/subtitles/{video_id}/en.auto.vtt',
                        'ext': 'vtt',
                        'name': 'English',
                    },
                ],
            },
            'formats': _fixture_formats(catalog, base_url, video_id, signed_in),
        }
        if video.get('chapters'):
            info['chapters'] = video['chapters']
        return info


class ArroxyFixtureYoutubeTabIE(YoutubeTabIE, plugin_name='arroxyfixture'):
    _VALID_URL = rf'https?://(?:www\.)?youtube\.com/playlist\?list=(?P<id>{_fixture_playlist_id_pattern()})(?:[&#].*)?$'

    def _real_extract(self, url):
        playlist_id = self._match_id(url)
        catalog = _fixture_catalog()
        playlist = next((candidate for candidate in _fixture_playlists(catalog) if candidate['id'] == playlist_id), None)
        if playlist is None:
            raise ExtractorError(f'Unknown Arroxy fixture playlist id: {playlist_id}')
        base_url = os.environ.get('ARROXY_E2E_FIXTURE_BASE_URL', '').rstrip('/')
        if not base_url:
            raise ExtractorError('ARROXY_E2E_FIXTURE_BASE_URL is required for Arroxy fixture extraction')
        # Recorded like a video extraction, under the playlist id, so the harness
        # sees what a collection probe handed yt-dlp.
        _notify_extraction(self, base_url, playlist_id, {})

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
