# Messages whose text comes from the site, next to messages that only put an id
# or a count from the response into yt-dlp's own sentence.
from ..utils._utils import ExtractorError
from ..utils._utils import dict_get, int_or_none
from ..utils.traversal import find_element, get_first, traverse_obj, try_get
from .common import InfoExtractor


class RelayIE(InfoExtractor):
    def whole_subscript(self, data):
        raise ExtractorError(data['error']['message'], expected=True)

    def get_chain(self, data):
        raise ExtractorError(data.get('error', {}).get('reason'), expected=True)

    def traverse_path(self, data):
        raise ExtractorError(traverse_obj(data, ('error', 'message')), expected=True)

    def traverse_branches(self, data):
        raise ExtractorError(traverse_obj(data, ('errors', 0, 'errorMessage', {str})), expected=True)

    def try_get_lambda(self, data):
        raise ExtractorError(try_get(data, lambda x: x['meta']['msg']), expected=True)

    def in_fstring(self, data):
        raise ExtractorError(f'The site said: {data["detail"]}', expected=True)

    def via_local(self, data):
        reason = traverse_obj(data, ('playability', 'reason'))
        raise ExtractorError(reason or 'Video unavailable', expected=True)

    def via_two_locals(self, data):
        error = data['status']
        text = error['description']
        raise ExtractorError(f'Error: {text}', expected=True)

    def via_get_text(self, data):
        reason = self._get_text(data, 'reason')
        self.raise_no_formats(reason, expected=True)

    def via_get_first(self, statuses):
        self.raise_login_required(get_first(statuses, 'subreason'))

    def warning_relay(self, data):
        self.report_warning(data['notice'])

    def traverse_alternatives(self, data):
        # Each path after the object is an alternative, not a continuation.
        msg = traverse_obj(data, ('messages', '__default'), 'title', expected_type=str)
        raise ExtractorError(msg or 'Got empty response', expected=True)

    def dict_get_alternatives(self, data):
        raise ExtractorError(dict_get(data, ('code', 'message')), expected=True)

    def page_regex(self, webpage):
        error = self._html_search_regex(r'<p class="err">(.+?)</p>', webpage, 'error message', default=None)
        if error:
            raise ExtractorError(error, expected=True)

    def page_element(self, webpage):
        error = traverse_obj(webpage, {find_element(cls='vp_video_stub_txt')})
        if error:
            raise ExtractorError(error, expected=True)

    def list_index(self, resp):
        raise ExtractorError(f'MiniTV said: {resp["errors"][0]["message"]}')

    def via_list_item(self, json_data):
        errors = json_data.get('errors')
        error = errors[0]
        self.raise_no_formats(error.get('message') or error['error_code'], expected=True)

    def page_element_number(self, td):
        track_number = traverse_obj(td, ({find_element(cls='py-xsmall')}, {int_or_none}))
        self.report_warning(f'Skipping track {track_number}, ID(s) not found')

    def container_code(self, resp):
        raise ExtractorError(f'API error {resp["error"]["code"]}')

    def get_chain_code(self, resp):
        raise ExtractorError(f'API error {resp.get("error", {}).get("code")}')

    def branch_alternatives(self, data):
        # A nested tuple is a set of branches, not a deeper path.
        raise ExtractorError(traverse_obj(data, (('error', 'error_description'), {str})), expected=True)

    def appended(self, error):
        msg = 'Unable to login'
        msg += ': ' + error['description']
        self.report_warning(msg)

    def identity_branch(self, data):
        # `None` in a branch set is the object itself: here, the error string.
        raise ExtractorError(traverse_obj(data, ('error', ('code', None), {str})), expected=True)

    def get_fallback(self, data):
        raise ExtractorError(data.get('code', data['message']), expected=True)

    def append_other_branch(self, ok, error):
        msg = 'Login failed'
        if ok:
            msg += ': ' + error['description']
            self.report_warning(msg)
        else:
            raise ExtractorError(msg)

    def fallback_through_index(self, data):
        raise ExtractorError(data.get('codes', [data['message']])[0], expected=True)

    def append_after_site(self):
        msg = 'Unable to login'
        self.report_warning(msg)
        msg += ': retrying'
        return msg

    def append_after_copy(self):
        msg = 'Unable to login'
        copied = msg
        msg += ': retrying'
        self.report_warning(copied)

    def appends_in_order(self, cond):
        msg = 'Login failed'
        if cond:
            msg += ': first'
        msg += ': second'
        self.report_warning(msg)

    def nested_scope(self):
        msg = 'Login failed'

        def decorate(msg):
            msg += ': private'
            return msg

        self.report_warning(msg)

    def nonlocal_append(self, data):
        msg = 'Login failed'

        def explain():
            nonlocal msg
            msg += ': ' + data['description']

        explain()
        self.report_warning(msg)

    def default_in_enclosing_scope(self, data):
        def decorate(value=(msg := data['message'])):
            return value

        self.report_warning(msg)

    def page_regex_id_only(self, webpage):
        video = self._search_regex(r'id=(\d+)', webpage, 'video id')
        raise ExtractorError(f'Video {video} is gone', expected=True)

    def id_only(self, data):
        raise ExtractorError(f'Video {data["id"]} not found', expected=True)

    def count_only(self, data):
        raise ExtractorError(f'Only {traverse_obj(data, ("count", {int}))} items', expected=True)
