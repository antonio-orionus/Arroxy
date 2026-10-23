from ..utils._utils import YoutubeDLError


class RequestError(YoutubeDLError):
    pass


class TransportError(RequestError):
    pass


class HTTPError(RequestError):
    def __init__(self, response, redirect_loop=False):
        # As upstream: the message is built in a local and passed by keyword.
        msg = f'HTTP Error {response.status}: {response.reason}'
        if redirect_loop:
            msg += ' (redirect loop detected)'
        super().__init__(msg=msg)


class ProxyError(RequestError):
    pass


network_exceptions = (HTTPError,)


def fail(response):
    raise HTTPError(response)


def proxy():
    raise ProxyError('Proxy refused the connection')
