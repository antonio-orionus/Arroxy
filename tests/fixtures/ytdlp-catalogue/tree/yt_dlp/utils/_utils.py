# A miniature of yt-dlp's exception classes, shaped like the real ones.


class YoutubeDLError(Exception):
    msg = None

    def __init__(self, msg=None):
        if msg is not None:
            self.msg = msg


class ExtractorError(YoutubeDLError):
    def __init__(self, msg, tb=None, expected=False, cause=None, video_id=None, ie=None):
        super().__init__(msg)


class UnsupportedError(ExtractorError):
    def __init__(self, url):
        super().__init__(
            f'Unsupported URL: {url}', expected=True)


class RegexNotFoundError(ExtractorError):
    pass


class GeoRestrictedError(ExtractorError):
    def __init__(self, msg, countries=None, **kwargs):
        kwargs['expected'] = True
        super().__init__(msg, **kwargs)


class UserNotLive(ExtractorError):
    def __init__(self, msg=None, **kwargs):
        kwargs['expected'] = True
        super().__init__(msg or 'The channel is not currently live', **kwargs)


class LateSuffixError(YoutubeDLError):
    def __init__(self):
        msg = 'Session expired'
        super().__init__(msg)
        msg += ': retrying'


class BranchedError(YoutubeDLError):
    def __init__(self, cond):
        msg = 'Login failed'
        if cond:
            msg += ': first'
        else:
            super().__init__(msg)


def branched():
    raise BranchedError(True)


def expire():
    raise LateSuffixError()


class DownloadError(YoutubeDLError):
    def __init__(self, msg, exc_info=None):
        super().__init__(msg)


class PostProcessingError(YoutubeDLError):
    pass


class DownloadCancelled(YoutubeDLError):
    msg = 'The download was cancelled'


class ExistingVideoReached(DownloadCancelled):
    pass


def bug_reports_message(before=';'):
    return before + ' please report this issue'
