# A miniature of InfoExtractor: the helpers whose signatures the extractor reads
# (message defaults, fatal defaults, positional order) and the messages their
# bodies raise.
from ..utils._utils import ExtractorError, GeoRestrictedError, RegexNotFoundError, bug_reports_message

NO_DEFAULT = object()


class InfoExtractor:
    def report_warning(self, msg, video_id=None, *args, only_once=False, **kwargs):
        self._downloader.report_warning(f'[{self.IE_NAME}] {msg}', *args, **kwargs)

    def to_screen(self, msg, *args, **kwargs):
        self._downloader.to_screen(f'[{self.IE_NAME}] {msg}', *args, **kwargs)

    def raise_login_required(
            self, msg='This video is only available for registered users',
            metadata_available=False, method=NO_DEFAULT):
        raise ExtractorError(msg, expected=True)

    def raise_geo_restricted(
            self, msg='This video is not available from your location due to geo restriction',
            countries=None, metadata_available=False):
        raise GeoRestrictedError(msg, countries=countries)

    def raise_no_formats(self, msg, expected=False, video_id=None):
        raise ExtractorError(msg, expected=expected, video_id=video_id)

    def report_drm(self, video_id):
        self.raise_no_formats('This video is DRM protected', expected=True, video_id=video_id)

    def _request_webpage(self, url_or_request, video_id, note=None, errnote=None, fatal=True, data=None):
        try:
            return self._downloader.urlopen(url_or_request)
        except Exception as err:
            if errnote is None:
                errnote = 'Unable to download webpage'
            errmsg = f'{errnote}: {err}'
            if fatal:
                raise ExtractorError(errmsg, cause=err, video_id=video_id)
            self.report_warning(errmsg, video_id=video_id)

    # yt-dlp builds _download_json and kin from a factory, not a def.
    def __create_download_methods(name, note, errnote):

        def download_handle(self, url_or_request, video_id, note=note, errnote=errnote, transform_source=None,
                            fatal=True):
            return self._request_webpage(url_or_request, video_id, note, errnote, fatal)

        def download_content(self, url_or_request, video_id, note=note, errnote=errnote, transform_source=None,
                             fatal=True):
            return download_handle(self, url_or_request, video_id, note, errnote, transform_source, fatal)

        return download_handle, download_content

    _download_json_handle, _download_json = __create_download_methods(
        'json', 'Downloading JSON metadata', 'Unable to download JSON metadata')
    __download_webpage = __create_download_methods('webpage', None, None)[1]

    def _extract_m3u8_formats(self, *args, **kwargs):
        fmts, subs = self._extract_m3u8_formats_and_subtitles(*args, **kwargs)
        return fmts

    def _extract_m3u8_formats_and_subtitles(self, m3u8_url, video_id, ext=None, note=None, errnote=None, fatal=True):
        return self._request_webpage(m3u8_url, video_id, note, errnote, fatal), {}

    def _search_regex(self, pattern, string, name, default=NO_DEFAULT, fatal=True, flags=0, group=None):
        _name = name
        if default is not NO_DEFAULT:
            return default
        elif fatal:
            raise RegexNotFoundError(f'Unable to extract {_name}')
        else:
            self.report_warning(f'unable to extract {_name}' + bug_reports_message())

    def _html_search_regex(self, pattern, string, name, default=NO_DEFAULT, fatal=True, flags=0, group=None):
        return self._search_regex(pattern, string, name, default, fatal, flags, group)

    def _html_search_meta(self, name, html, display_name=None, fatal=False, **kwargs):
        return self._search_regex(name, html, display_name or name, fatal=fatal, **kwargs)
