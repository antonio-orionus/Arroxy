# One method per case, so each site is found by its scope.
from ..networking.exceptions import HTTPError, TransportError
from ..utils._utils import ExtractorError, GeoRestrictedError, UnsupportedError, UserNotLive
from .common import NO_DEFAULT, InfoExtractor


class ExampleIE(InfoExtractor):
    IE_NAME = 'example:site'

    def literal(self):
        raise ExtractorError('This video has been removed', expected=True)

    def non_ascii(self):
        raise ExtractorError('您所在区域暂无此内容版权 – Sign in to confirm you’re not a bot', expected=True)

    def bug_report(self):
        raise ExtractorError('Could not find player data')

    def dynamic_expected(self, ok):
        raise ExtractorError('Maybe expected', expected=ok)

    def fstring(self, video_id):
        raise ExtractorError(f'Video {video_id} is private', expected=True)

    def percent(self, video_id, kind):
        raise ExtractorError('Video %s is %s' % (video_id, kind), expected=True)

    def format_call(self, video_id):
        raise ExtractorError('Video {} not found'.format(video_id), expected=True)

    def concatenated(self, video_id):
        raise ExtractorError('Premium only: ' + video_id, expected=True)

    def local_literal(self):
        msg = 'Sold out'
        raise ExtractorError(msg, expected=True)

    def not_resolvable(self, msg):
        raise ExtractorError(msg)

    def with_cause(self):
        try:
            self._download_json('https://example.com', None)
        except ExtractorError as e:
            if isinstance(e.cause, HTTPError) and e.cause.status == 403:
                raise ExtractorError('Access denied', expected=True, cause=e)
            raise

    def http_else(self):
        try:
            self._download_json('https://example.com', None)
        except ExtractorError as e:
            if isinstance(e.cause, HTTPError):
                raise ExtractorError('The HTTP side', expected=True)
            else:
                raise ExtractorError('The other side')

    def http_negated(self):
        try:
            self._download_json('https://example.com', None)
        except ExtractorError as e:
            if not isinstance(e.cause, HTTPError):
                raise ExtractorError('Not an HTTP error')

    def http_compound(self, is_retry):
        try:
            self._download_json('https://example.com', None)
        except ExtractorError as e:
            if is_retry or not isinstance(e.cause, HTTPError):
                raise
            elif e.cause.status == 403:
                raise ExtractorError('Account cannot access this', expected=True)

    def http_short_circuit(self):
        try:
            self._download_json('https://example.com', None)
        except ExtractorError as e:
            if isinstance(e.cause, HTTPError) and self._download_json('https://example.com/error', None, errnote='Unable to read the error'):
                raise

    def http_either(self, e):
        if isinstance(e, HTTPError) or isinstance(e, TransportError):
            raise ExtractorError('Network failure')

    def login_kwargs(self, **kwargs):
        self.raise_login_required(**kwargs)

    def kwargs_forward(self, url, video_id, **kwargs):
        return self._download_json(url, video_id, **kwargs)

    def starred_raise(self, *args):
        raise ExtractorError(*args)

    def regex_kwargs(self, webpage, **kwargs):
        return self._search_regex(r'"title":"([^"]+)"', webpage, 'title', **kwargs)

    def regex_dynamic_default(self, webpage, fatal):
        return self._search_regex(r'http-equiv="refresh"', webpage, 'meta refresh redirect', default=NO_DEFAULT if fatal else None)

    def network_except(self):
        try:
            self._download_json('https://example.com', None)
        except HTTPError:
            raise ExtractorError('Request failed')

    def transport_except(self):
        try:
            self._download_json('https://example.com', None)
        except TransportError:
            # Also catches subclasses (SSLError, IncompleteRead), which yt-dlp
            # does not count as network errors for expected=.
            raise ExtractorError('Transport failed')

    def login_default(self):
        self.raise_login_required()

    def login_password(self):
        self.raise_login_required(method='password')

    def login_cookies(self):
        self.raise_login_required('Members only', method='cookies')

    def login_dynamic(self, how):
        self.raise_login_required(method=how)

    def login_metadata(self):
        self.raise_login_required(metadata_available=True)

    def geo_default(self):
        self.raise_geo_restricted(countries=['DE'])

    def geo_class(self):
        raise GeoRestrictedError('Only in Germany')

    def no_formats(self, video_id):
        self.raise_no_formats('No video formats found', expected=True, video_id=video_id)

    def drm(self, video_id):
        self.report_drm(video_id)

    def unsupported(self, url):
        raise UnsupportedError(url)

    def not_live(self):
        raise UserNotLive(video_id='x')

    def warning(self):
        self.report_warning('Falling back to the mobile API')

    def status(self, video_id):
        self.to_screen(f'{video_id}: Downloading the archive')

    def debug(self):
        self.write_debug('Using the TV client')

    def deprecation(self):
        self._downloader.deprecation_warning('--old-option is deprecated')

    def regex_fatal(self, webpage):
        return self._search_regex(r'"title":"([^"]+)"', webpage, 'title')

    def regex_not_fatal(self, webpage):
        return self._search_regex(r'"views":(\d+)', webpage, 'view count', fatal=False)

    def regex_with_default(self, webpage):
        return self._search_regex(r'"likes":(\d+)', webpage, 'like count', default=None)

    def regex_meta(self, webpage):
        return self._html_search_meta('description', webpage)

    def download_default(self, video_id):
        return self._download_json('https://example.com/api', video_id)

    def download_errnote(self, video_id):
        return self._download_json(
            'https://example.com/api', video_id, 'Downloading player', 'Unable to download player')

    def download_quiet(self, video_id):
        return self._download_json('https://example.com/api', video_id, note=False, errnote=False, fatal=False)

    def download_forwarded(self, video_id):
        return self._extract_m3u8_formats('https://example.com/hls.m3u8', video_id, 'mp4', fatal=False)

    def download_not_fatal(self, video_id):
        return self._request_webpage('https://example.com', video_id, fatal=False)


class OtherIE(InfoExtractor):
    def plain(self):
        raise ExtractorError('Other failure', expected=True)


def module_helper():
    raise ExtractorError('Module level', expected=True)
