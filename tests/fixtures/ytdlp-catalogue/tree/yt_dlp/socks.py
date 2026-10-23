# As upstream: a ProxyError of its own, derived from OSError, not the
# networking one. Its subclasses are not yt-dlp errors.


class ProxyError(OSError):
    pass


class Socks4Error(ProxyError):
    def __init__(self, code=None, msg=None):
        super().__init__(code, msg)


def connect():
    raise Socks4Error(91)
