from .utils._utils import DownloadError, ExistingVideoReached


class YoutubeDL:
    def report_error(self, message, *args, **kwargs):
        self.trouble(f'ERROR: {message}', *args, **kwargs)

    def process(self, info):
        if not info:
            self.report_error('no suitable formats')
            raise DownloadError('Requested format is not available')
        raise ExistingVideoReached()

    def builtin(self):
        # The builtin, not the JS interpreter's nested class of the same name.
        raise Exception('Not a yt-dlp error')


class JSInterpreter:
    class Exception(DownloadError):
        def __init__(self, msg, expr=None):
            super().__init__(msg)

    def interpret(self, expr):
        raise self.Exception(f'Unsupported JS expression {expr}')
