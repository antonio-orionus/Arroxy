"""Every message site in a yt-dlp source tree, for the yt-dlp message catalogue.

Reads the tree under the first argument (a yt-dlp checkout) with Python's own
`ast` module: the source is parsed as text, never imported or run. Writes JSON
on stdout: one entry per call that raises, reports or prints a message, with its
text as a template and the flags the catalogue's label rules read. Facts only;
scripts/ytdlp-catalogue/extract.ts validates the shape.

What a site is, by kind:

- raise: a call to an exception class that derives from YoutubeDLError.
- helper: raise_login_required, raise_geo_restricted, raise_no_formats, report_drm.
- report: report_error, report_warning, deprecation_warning.
- status: to_screen, write_debug, and the note= of a download helper.
- regex: a call to an InfoExtractor method taking `name` and `fatal`
  (_search_regex and kin), which prints "Unable to extract {name}" unless it has
  a default.
- download: a call to an InfoExtractor method taking `errnote` and `fatal`
  (_download_json and kin), which prints "{errnote}: {cause}".

The helper families, the message defaults and the positional order of every
argument come from the signatures in the tree itself, so a renamed parameter or a
new helper is followed without a change here.
"""

import ast
import json
import re
import string
import sys
from pathlib import Path

HELPERS = {'raise_login_required', 'raise_geo_restricted', 'raise_no_formats', 'report_drm'}
REPORTS = {'report_error', 'report_warning', 'deprecation_warning'}
STATUS = {'to_screen', 'write_debug'}
MESSAGE_PARAMS = {'msg', 'message'}
LOGIN_METHODS = {'password', 'cookies', 'session_cookies', 'any'}

# Calls that read a field out of fetched data; the keys after the first argument
# are the path. `.get` is matched on its own.
DATA_READERS = {'traverse_obj', 'try_get', 'dict_get', 'get_first', 'try_call', '_get_text'}

# A read of one of these keys, compared lower-case without `_` or `-`, is site
# text: the message shows what the site said rather than yt-dlp's own words.
# Ids, counts, urls and codes are template holes, not relays.
TEXT_KEYS = {
    'message', 'messages', 'msg', 'errormessage', 'errormsg', 'errmsg', 'errmessage', 'errortext',
    'error', 'errors', 'err', 'reason', 'subreason', 'description', 'desc', 'detail', 'details',
    'title', 'text', 'simpletext', 'statusmessage', 'errordescription', 'notice', 'alert',
    'displaymessage', 'usermessage', 'localizedmessage', 'txt', 'subcaption', 'caption',
}

# Helpers that return an HTML element's text: anything they read into a message
# is page text.
ELEMENT_READERS = {
    'find_element', 'find_elements', 'get_element_by_class', 'get_element_by_id', 'get_element_by_attribute',
    'get_elements_by_class', 'get_element_html_by_class', 'get_element_html_by_id', 'get_element_text_and_html_by_tag',
}

HTTP_CHECK = re.compile(r'\b(?:HTTPError|network_exceptions|TransportError)\b')
PRINTF = re.compile(r'%%|%(?:\((\w+)\))?[-#0 +]*(?:\*|\d+)?(?:\.(?:\*|\d+))?[sdirfFxXoeEgGc]')
MAX_HOPS = 2


def callee_name(call):
    func = call.func
    if isinstance(func, ast.Name):
        return func.id
    if isinstance(func, ast.Attribute):
        return func.attr
    return None


def params_of(func):
    """Parameter names after `self`, in positional order, then keyword-only."""
    args = func.args
    positional = [a.arg for a in args.posonlyargs + args.args]
    if positional and positional[0] in ('self', 'cls'):
        positional = positional[1:]
    return positional + [a.arg for a in args.kwonlyargs]


def defaults_of(func):
    args = func.args
    positional = args.posonlyargs + args.args
    out = dict(zip([a.arg for a in positional[len(positional) - len(args.defaults):]], args.defaults))
    out.update({a.arg: d for a, d in zip(args.kwonlyargs, args.kw_defaults) if d is not None})
    return out


def bind(call, params):
    """Map a call's arguments to the callee's parameter names."""
    bound = {}
    positional = [p for p in params]
    for index, arg in enumerate(call.args):
        if isinstance(arg, ast.Starred) or index >= len(positional):
            break
        bound[positional[index]] = arg
    for keyword in call.keywords:
        if keyword.arg is not None:
            bound[keyword.arg] = keyword.value
    return bound


def unpacks(call):
    """Whether arguments reach the callee through `*args` or `**kwargs`, so an
    unbound parameter may still be passed."""
    return any(isinstance(a, ast.Starred) for a in call.args) or any(k.arg is None for k in call.keywords)


UNKNOWN = object()


def http_when(test):
    """True when the test holding implies an HTTP error, False when its failing
    does, None when neither follows."""
    if isinstance(test, ast.UnaryOp) and isinstance(test.op, ast.Not):
        inner = http_when(test.operand)
        return None if inner is None else not inner
    if isinstance(test, ast.BoolOp):
        parts = [http_when(v) for v in test.values]
        # `a and b` holding means each holds; `a or b` failing means each fails.
        # The other way round, every part has to agree.
        wanted = isinstance(test.op, ast.And)
        if wanted in parts:
            return wanted
        return (not wanted) if all(part is (not wanted) for part in parts) else None
    return True if HTTP_CHECK.search(ast.unparse(test)) else None


def is_fallback(node):
    """Whether a regex helper's `default=` is a value it returns instead of
    failing: a literal, never the NO_DEFAULT sentinel."""
    return isinstance(node, (ast.Constant, ast.Dict, ast.List, ast.Tuple, ast.Set, ast.JoinedStr))


def is_constant(node, value):
    return isinstance(node, ast.Constant) and node.value is value


def tristate(node):
    if isinstance(node, ast.Constant) and isinstance(node.value, bool):
        return 'yes' if node.value else 'no'
    if isinstance(node, ast.Constant) and node.value is None:
        return 'no'
    return 'dynamic'


def normal_key(key):
    return key.lower().replace('_', '').replace('-', '')


def own_scope(node):
    """The nodes of a function body, without the bodies of nested functions,
    lambdas or classes: their names are other variables. What a nested
    definition evaluates where it stands (defaults, decorators) stays in, and so
    do its writes to a name it declares `nonlocal`."""
    pending = list(ast.iter_child_nodes(node))
    while pending:
        child = pending.pop()
        yield child
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            args = child.args
            pending.extend(args.defaults + [d for d in args.kw_defaults if d is not None] + getattr(child, 'decorator_list', []))
            shared = {name for n in ast.walk(child) if isinstance(n, ast.Nonlocal) for name in n.names}
            pending.extend(n for n in ast.walk(child) if isinstance(n, (ast.Assign, ast.AugAssign)) and any(isinstance(t, ast.Name) and t.id in shared for t in (n.targets if isinstance(n, ast.Assign) else [n.target])))
        elif isinstance(child, ast.ClassDef):
            pending.extend(child.decorator_list + child.bases)
        else:
            pending.extend(ast.iter_child_nodes(child))


class Function:
    """Assignments to plain names inside one function, for following a message
    through a local variable."""

    def __init__(self, node, regex_helpers=None, site=None):
        self.regex_helpers = regex_helpers or {}
        self.site = site
        self.parents = {child: parent for parent in ast.walk(node) for child in ast.iter_child_nodes(parent)} if node is not None else {}
        self.assigns = {}
        self.appends = {}
        for child in own_scope(node) if node is not None else ():
            if isinstance(child, ast.Assign):
                for target in child.targets:
                    if isinstance(target, ast.Name):
                        self.assigns.setdefault(target.id, []).append(child.value)
            elif isinstance(child, (ast.AnnAssign, ast.NamedExpr)) and isinstance(child.target, ast.Name) and child.value is not None:
                self.assigns.setdefault(child.target.id, []).append(child.value)
            elif isinstance(child, ast.AugAssign) and isinstance(child.op, ast.Add) and isinstance(child.target, ast.Name):
                # `msg += ': ' + error`: an optional suffix to the one assignment.
                self.appends.setdefault(child.target.id, []).append(child)

    def single(self, name):
        values = self.assigns.get(name, [])
        return values[0] if len(values) == 1 else None

    def appended(self, name, before=None):
        """What may be appended to `name` with `+=`: every append in the function
        except one on the other branch of an `if` the site sits in. Deliberately
        an over-estimate for relays, as `relays` is a may: a static read does not
        follow loops, early returns or exceptions. A template passes the read of
        `name` as `before` and takes only appends ahead of it, so it never
        invents text."""
        anchor = before or self.site
        return [
            aug.value
            for aug in sorted(self.appends.get(name, []), key=lambda aug: (aug.lineno, aug.col_offset))
            if not (anchor is not None and self.exclusive(aug, anchor))
            and not (before is not None and (aug.lineno, aug.col_offset) >= (before.lineno, before.col_offset))
        ]

    def exclusive(self, aug, anchor):
        site_branches = self.branches(anchor)
        return any(site_branches.get(id(node), branch) != branch for node, branch in self.branches(aug, nodes=True))

    def branches(self, node, nodes=False):
        """Each `if` above the node, with the branch the node sits on."""
        out = []
        while node in self.parents:
            parent = self.parents[node]
            if isinstance(parent, ast.If) and node is not parent.test:
                out.append((parent, 'body' if any(stmt is node for stmt in parent.body) else 'orelse'))
            node = parent
        return out if nodes else {id(n): branch for n, branch in out}


class Template:
    """A message expression as literal text and `{expression}` holes."""

    def __init__(self, scope):
        self.scope = scope
        self.parts = []

    def text(self):
        return ''.join(value.replace('{', '{{').replace('}', '}}') if literal else '{' + value + '}' for literal, value in self.parts)

    def has_text(self):
        return any(literal and value.strip() for literal, value in self.parts)

    def has_holes(self):
        return any(not literal for literal, _ in self.parts)

    def add(self, node, hops=0):
        if isinstance(node, ast.Constant) and isinstance(node.value, str):
            self.parts.append((True, node.value))
        elif isinstance(node, ast.JoinedStr):
            for value in node.values:
                if isinstance(value, ast.FormattedValue):
                    self.hole(value.value)
                else:
                    self.add(value, hops)
        elif isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
            self.add(node.left, hops)
            self.add(node.right, hops)
        elif isinstance(node, ast.BinOp) and isinstance(node.op, ast.Mod) and isinstance(node.left, ast.Constant) and isinstance(node.left.value, str):
            self.printf(node.left.value, node.right)
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'format' and isinstance(node.func.value, ast.Constant) and isinstance(node.func.value.value, str):
            self.format(node.func.value.value, node)
        elif isinstance(node, ast.Name) and hops < MAX_HOPS and self.scope.single(node.id) is not None:
            self.add(self.scope.single(node.id), hops + 1)
            for appended in self.scope.appended(node.id, before=node):
                self.hole(appended)
        else:
            self.hole(node)

    def hole(self, node):
        self.parts.append((False, ast.unparse(node)))

    def printf(self, fmt, right):
        args = right.elts if isinstance(right, ast.Tuple) else [right]
        named = {k.value: v for k, v in zip(right.keys, right.values) if isinstance(k, ast.Constant)} if isinstance(right, ast.Dict) else {}
        position = 0
        last = 0
        for match in PRINTF.finditer(fmt):
            self.parts.append((True, fmt[last:match.start()]))
            last = match.end()
            if match.group(0) == '%%':
                self.parts.append((True, '%'))
            elif match.group(1) is not None:
                value = named.get(match.group(1))
                self.parts.append((False, ast.unparse(value) if value is not None else match.group(1)))
            else:
                self.parts.append((False, ast.unparse(args[position]) if position < len(args) else '?'))
                position += 1
        self.parts.append((True, fmt[last:]))

    def format(self, fmt, call):
        keywords = {k.arg: k.value for k in call.keywords if k.arg}
        position = 0
        for literal, field, _, _ in string.Formatter().parse(fmt):
            self.parts.append((True, literal))
            if field is None:
                continue
            if field == '':
                value = call.args[position] if position < len(call.args) else None
                position += 1
            elif field.isdigit():
                value = call.args[int(field)] if int(field) < len(call.args) else None
            else:
                value = keywords.get(field)
            self.parts.append((False, ast.unparse(value) if value is not None else field))


def string_value(node):
    return node.value if isinstance(node, ast.Constant) and isinstance(node.value, str) else None


def read_paths(node, scope, hops=0):
    """The field paths a data read may take, each a list of keys: one for a
    subscript or `.get` chain, one per alternative for traverse_obj and kin.
    Empty when the expression is not a data read."""
    if isinstance(node, ast.Subscript):
        key = string_value(node.slice)
        if key is None:
            # An index into a list (`errors[0]`) keeps the path it indexes.
            return read_paths(node.value, scope, hops)
        return [prefix + [key] for prefix in read_paths(node.value, scope, hops) or [[]]]
    if isinstance(node, ast.Call):
        name = callee_name(node)
        if isinstance(node.func, ast.Attribute) and name == 'get' and node.args:
            key = string_value(node.args[0])
            return [prefix + [key] for prefix in read_paths(node.func.value, scope, hops) or [[]]] if key is not None else []
        if name in DATA_READERS and node.args:
            prefixes = read_paths(node.args[0], scope, hops) or [[]]
            if name == 'dict_get':
                keys = node.args[1].elts if len(node.args) > 1 and isinstance(node.args[1], (ast.Tuple, ast.List)) else node.args[1:2]
                alternatives = [[k] for k in map(string_value, keys) if k is not None]
            elif name == 'try_get':
                getters = node.args[1].elts if len(node.args) > 1 and isinstance(node.args[1], (ast.Tuple, ast.List)) else node.args[1:2]
                alternatives = [path for getter in getters if isinstance(getter, ast.Lambda) for path in read_paths(getter.body, scope, hops)]
            else:
                alternatives = [path for arg in node.args[1:] for path in traversal_paths(arg)]
            return [prefix + alternative for prefix in prefixes for alternative in alternatives if alternative]
    if isinstance(node, ast.Name) and hops < MAX_HOPS and scope.single(node.id) is not None:
        return read_paths(scope.single(node.id), scope, hops + 1)
    return []


MAX_BRANCHES = 16


def fallbacks(read):
    """The expressions a data read returns when its path finds nothing."""
    if isinstance(read, ast.Subscript):
        # The whole fallback, not the indexed element: `relays` is a may.
        return fallbacks(read.value)
    if not isinstance(read, ast.Call):
        return []
    out = [k.value for k in read.keywords if k.arg == 'default']
    name = callee_name(read)
    if name == 'get' and isinstance(read.func, ast.Attribute):
        out += read.args[1:2]
    elif name == 'dict_get':
        out += read.args[2:3]
    return out


def traversal_paths(node):
    """The key paths one traverse_obj path argument can take. A tuple is a path;
    a tuple or list inside it is a set of branches, each its own key or path.
    Indexes, `...`, filters and lambdas add no key."""
    return [path for path in branch_paths(node) if path]


def branch_paths(node):
    if string_value(node) is not None:
        return [[node.value]]
    if isinstance(node, ast.Constant) and (node.value is None or node.value is Ellipsis):
        # `None` in a branch set is the object itself.
        return [[]]
    if not isinstance(node, (ast.Tuple, ast.List)):
        return []
    paths = [[]]
    for element in node.elts:
        if string_value(element) is not None:
            paths = [path + [element.value] for path in paths]
        elif isinstance(element, (ast.Tuple, ast.List)):
            branches = [branch for sub in element.elts for branch in branch_paths(sub)] or [[]]
            paths = [path + branch for path in paths for branch in branches][:MAX_BRANCHES]
    return paths


def names_text(field):
    """Whether a field name or selector names text: 'error message',
    'uc-error-subcaption', 'vp_video_stub_txt', 'errorMessage'."""
    words = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?![a-z])', field)
    return normal_key(field) in TEXT_KEYS or any(normal_key(word) in TEXT_KEYS for word in words)


def page_scrape(call, scope):
    """`page:<field>` when the call reads text off the page: a regex helper or an
    HTML element helper whose field name or selector names text. Ids, counts and
    links scraped the same way are template holes."""
    name = callee_name(call)
    if name in scope.regex_helpers:
        field = string_value(scope.regex_helpers[name].get(call))
    elif name in ELEMENT_READERS:
        field = next((string_value(a) for a in call.args + [k.value for k in call.keywords] if string_value(a)), None)
    else:
        return None
    return f'page:{field}' if field and names_text(field) else None


def relay_of(node, scope, hops=0, seen=None):
    """The field path of site text this expression shows, or None."""
    seen = set() if seen is None else seen
    pending = [node]
    while pending:
        child = pending.pop(0)
        if isinstance(child, ast.Call) and (scraped := page_scrape(child, scope)):
            return scraped
        paths = read_paths(child, scope) if isinstance(child, (ast.Subscript, ast.Call)) else []
        if paths:
            # Only the outermost read of a chain counts: `data['error']['code']`
            # shows a code, though its container is named `error`.
            found = next(('.'.join(path) for path in paths if normal_key(path[-1]) in TEXT_KEYS), None)
            if found:
                return found
            # The receiver chain is done with, but a fallback can still supply
            # the text: `data.get('code', data['message'])`.
            pending.extend(fallbacks(child))
            continue
        if isinstance(child, ast.Name) and hops < MAX_HOPS and child.id not in seen:
            seen.add(child.id)
            for value in scope.assigns.get(child.id, []) + scope.appended(child.id):
                found = relay_of(value, scope, hops + 1, seen)
                if found:
                    return found
        pending.extend(ast.iter_child_nodes(child))
    return None


class Callee:
    """What the extractor knows about a function or exception class it matched."""

    def __init__(self, kind, params, defaults, default_message=None):
        self.kind = kind
        self.params = params
        self.defaults = defaults
        self.default_message = default_message

    def get(self, call):
        """The argument a call passes for the message parameter."""
        param = self.message_param()
        return bind(call, self.params).get(param) if param else None

    def message_param(self):
        if self.kind in ('regex',):
            return 'name'
        if self.kind == 'download':
            return 'errnote'
        if self.params and (self.params[0] in MESSAGE_PARAMS or self.kind in ('report', 'status')):
            return self.params[0]
        return next((p for p in self.params if p in MESSAGE_PARAMS), None)


class Tree:
    def __init__(self, root):
        self.root = root
        self.modules = {}
        self.failures = []
        self.files = 0
        if not (root / 'yt_dlp').is_dir():
            raise SystemExit(f'{root} is not a yt-dlp checkout: it has no yt_dlp package')
        for path in sorted((root / 'yt_dlp').rglob('*.py')):
            rel = path.relative_to(root).as_posix()
            self.files += 1
            try:
                self.modules[rel] = ast.parse(path.read_text(encoding='utf-8'), filename=rel)
            except (SyntaxError, ValueError, UnicodeDecodeError) as error:
                self.failures.append({'file': rel, 'error': f'{type(error).__name__}: {error}'})
        # A name means the class its own module defines first (socks.py has a
        # ProxyError of its own, apart from the networking one), then a
        # module-level class anywhere. A nested class (the JS interpreter's own
        # `Exception`) is reached only as `self.X`, so a bare `Exception` stays
        # the builtin.
        self.local = {}
        self.module_of = {}
        self.classes = {}
        self.nested = {}
        for rel, module in self.modules.items():
            top = {node for node in module.body if isinstance(node, ast.ClassDef)}
            self.local[rel] = {node.name: node for node in module.body if isinstance(node, ast.ClassDef)}
            for node in ast.walk(module):
                if isinstance(node, ast.ClassDef):
                    self.module_of[node] = rel
                    (self.classes if node in top else self.nested).setdefault(node.name, node)
        for anchor in ('InfoExtractor', 'YoutubeDLError'):
            if anchor not in self.classes:
                raise SystemExit(f'{root} is not a yt-dlp checkout: its yt_dlp package defines no {anchor}')
        self.methods = self.method_callees()
        self.regex_helpers = {name: callee for name, callee in self.methods.items() if callee.kind == 'regex'}
        self.exceptions = self.exception_callees()

    def callee(self, call, rel):
        if isinstance(call.func, ast.Name):
            cls = self.local.get(rel, {}).get(call.func.id) or self.classes.get(call.func.id)
            return self.exceptions.get(cls) if cls is not None else self.methods.get(call.func.id)
        if isinstance(call.func, ast.Attribute):
            cls = self.classes.get(call.func.attr) or self.nested.get(call.func.attr)
            return self.exceptions.get(cls) if cls is not None else self.methods.get(call.func.attr)
        return None

    def bases(self, cls):
        out = []
        local = self.local.get(self.module_of.get(cls), {})
        for base in cls.bases:
            name = base.id if isinstance(base, ast.Name) else base.attr if isinstance(base, ast.Attribute) else None
            found = local.get(name) or self.classes.get(name) or self.nested.get(name)
            if found is not None and found is not cls:
                out.append(found)
        return out

    def lineage(self, cls):
        seen, queue = [], [cls]
        while queue:
            current = queue.pop(0)
            if current in seen:
                continue
            seen.append(current)
            queue += self.bases(current)
        return seen

    def exception_callees(self):
        out = {}
        for cls in self.module_of:
            lineage = self.lineage(cls)
            if not any(c.name == 'YoutubeDLError' for c in lineage):
                continue
            init = next((f for c in lineage for f in c.body if isinstance(f, ast.FunctionDef) and f.name == '__init__'), None)
            params = params_of(init) if init else ['msg']
            defaults = defaults_of(init) if init else {}
            out[cls] = Callee('raise', params, defaults, self.exception_default(lineage, init, params, defaults))
        return out

    def exception_default(self, lineage, init, params, defaults):
        message = next((p for p in params if p in MESSAGE_PARAMS), None)
        if message and isinstance(defaults.get(message), ast.Constant) and isinstance(defaults[message].value, str):
            return defaults[message].value
        passed = self.super_message(init) if init else None
        if passed is not None:
            if isinstance(passed, ast.BoolOp) and isinstance(passed.op, ast.Or):
                passed = passed.values[-1]
            template = Template(Function(init))
            template.add(passed)
            if template.has_text():
                return template.text()
        for cls in lineage:
            for stmt in cls.body:
                if isinstance(stmt, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'msg' for t in stmt.targets) and isinstance(stmt.value, ast.Constant) and isinstance(stmt.value.value, str):
                    return stmt.value.value
        return None

    @staticmethod
    def super_message(init):
        for node in ast.walk(init):
            if isinstance(node, ast.Call) and callee_name(node) == '__init__':
                # `Base.__init__(self, msg)` passes self first; `super().__init__(msg)` doesn't.
                skip = 1 if isinstance(node.func, ast.Attribute) and isinstance(node.func.value, ast.Name) else 0
                if len(node.args) > skip:
                    return node.args[skip]
                passed = next((k.value for k in node.keywords if k.arg in MESSAGE_PARAMS), None)
                if passed is not None:
                    return passed
        return None

    def method_callees(self):
        info = self.classes.get('InfoExtractor')
        body = info.body if info else []
        methods = {f.name: (f, defaults_of(f)) for f in body if isinstance(f, ast.FunctionDef)}
        for stmt in body:
            methods.update(self.factory_methods(stmt, methods))
        # `_extract_m3u8_formats(self, *args, **kwargs)` passes everything on to
        # the method with the real signature, sometimes over two hops.
        for _ in range(MAX_HOPS):
            methods.update({name: methods[target] for name, (func, _) in methods.items() if (target := self.forwards_to(func)) in methods and target != name})
        out = {}
        for name, (func, defaults) in methods.items():
            params = params_of(func)
            if name in HELPERS:
                kind = 'helper'
            elif name in REPORTS:
                kind = 'report'
            elif name in STATUS:
                kind = 'status'
            elif 'fatal' in params and 'errnote' in params:
                kind = 'download'
            elif 'fatal' in params and 'name' in params:
                kind = 'regex'
            else:
                continue
            out[name] = Callee(kind, params, defaults, self.method_default(func, kind, params, defaults))
        for name in (REPORTS | STATUS) - out.keys():
            out[name] = Callee('report' if name in REPORTS else 'status', ['msg'], {})
        return out

    @staticmethod
    def forwards_to(func):
        """The method a `(self, *args, **kwargs)` method hands all its arguments to."""
        args = func.args
        if params_of(func) or args.vararg is None or args.kwarg is None:
            return None
        for node in ast.walk(func):
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and any(isinstance(a, ast.Starred) for a in node.args):
                return node.func.attr
        return None

    @staticmethod
    def factory_methods(stmt, methods):
        """Methods a class-body factory builds, as in
        `_download_json_handle, _download_json = __create_download_methods('json', ..., 'Unable to download JSON metadata', ...)`:
        each target gets the inner function the factory returns in its place, with
        defaults that name a factory parameter replaced by the argument passed."""
        if not isinstance(stmt, ast.Assign) or len(stmt.targets) != 1:
            return {}
        value, index = stmt.value, None
        if isinstance(value, ast.Subscript) and isinstance(value.slice, ast.Constant) and isinstance(value.slice.value, int):
            value, index = value.value, value.slice.value
        factory = methods.get(callee_name(value)) if isinstance(value, ast.Call) else None
        if factory is None:
            return {}
        factory = factory[0]
        returned = next((s.value for s in factory.body if isinstance(s, ast.Return)), None)
        inner = {f.name: f for f in factory.body if isinstance(f, ast.FunctionDef)}
        built = [e.id for e in returned.elts] if isinstance(returned, ast.Tuple) else [returned.id] if isinstance(returned, ast.Name) else []
        if index is not None:
            built = built[index:index + 1]
        target = stmt.targets[0]
        names = [t.id for t in target.elts if isinstance(t, ast.Name)] if isinstance(target, ast.Tuple) else [target.id] if isinstance(target, ast.Name) else []
        passed = bind(value, [a.arg for a in factory.args.posonlyargs + factory.args.args])
        out = {}
        for name, func_name in zip(names, built):
            func = inner.get(func_name)
            if func is None:
                continue
            defaults = {k: passed.get(v.id, v) if isinstance(v, ast.Name) else v for k, v in defaults_of(func).items()}
            out[name] = (func, defaults)
        return out

    def method_default(self, func, kind, params, defaults):
        message = Callee(kind, params, defaults).message_param()
        if message:
            default = defaults.get(message)
            return default.value if isinstance(default, ast.Constant) and isinstance(default.value, str) else None
        # report_drm: no message parameter; the message is what its body passes on.
        for node in ast.walk(func):
            if isinstance(node, ast.Call) and node.args and isinstance(node.args[0], ast.Constant) and isinstance(node.args[0].value, str):
                return node.args[0].value
        return None


class Extractor:
    def __init__(self, tree):
        self.tree = tree
        self.sites = []

    def run(self):
        for rel, module in self.tree.modules.items():
            parents = {child: node for node in ast.walk(module) for child in ast.iter_child_nodes(node)}
            for node in ast.walk(module):
                if isinstance(node, ast.Call):
                    self.visit(rel, node, parents)
        self.sites.sort(key=lambda site: (site['file'], site['line'], site['col']))
        for site in self.sites:
            del site['col']
        return self.sites

    def visit(self, rel, call, parents):
        name = callee_name(call)
        callee = self.tree.callee(call, rel)
        if callee is None:
            return
        bound = bind(call, callee.params)
        chain = self.ancestors(call, parents)
        scope = Function(next((n for n in chain if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))), None), self.tree.regex_helpers, call)
        where = {'file': rel, 'line': call.lineno, 'col': call.col_offset, 'scope': self.scope_name(chain), 'extractor': self.extractor_name(chain), 'call': name}
        unpacked = unpacks(call)
        flags = self.flags(name, callee, bound, chain, unpacked, call)

        if callee.kind == 'regex':
            default = bound.get('default')
            if default is not None and not (isinstance(default, ast.Name) and default.id == 'NO_DEFAULT'):
                if is_fallback(default):
                    return
                flags['hasDefault'] = 'dynamic'
            elif default is None and unpacked:
                flags['hasDefault'] = 'dynamic'
        if callee.kind == 'download':
            note = bound.get('note')
            if note is not None and not is_constant(note, False) and not is_constant(note, None):
                self.add(where, 'status', note, None, {}, scope)
            if is_constant(bound.get('errnote'), False):
                return
        param = callee.message_param()
        message = bound.get(param) if param else None
        if message is None and param and unpacked:
            # The message may arrive through *args or **kwargs: unknown, not the default.
            message = UNKNOWN
        elif is_constant(message, None):
            message = None
        self.add(where, callee.kind, message, callee.default_message, flags, scope)

    def add(self, where, kind, message, default, flags, scope):
        site = dict(where, kind=kind, flags=flags)
        if message is UNKNOWN:
            site.update(template=None, shape='dynamic', relays=None)
        elif message is None:
            site.update(template=default, shape='default', relays=None)
        else:
            template = Template(scope)
            template.add(message)
            relays = relay_of(message, scope)
            if relays:
                shape = 'relay'
            elif not template.has_holes():
                shape = 'literal'
            elif template.has_text():
                shape = 'template'
            else:
                shape = 'dynamic'
            site.update(template=None if shape == 'dynamic' else template.text(), shape=shape, relays=relays)
        self.sites.append(site)

    @staticmethod
    def flags(name, callee, bound, chain, unpacked, site):
        flags = {}
        if 'expected' in callee.params or 'expected' in bound:
            flags['expected'] = tristate(bound['expected']) if 'expected' in bound else 'dynamic' if unpacked else 'absent'
        if callee.kind in ('regex', 'download'):
            if 'fatal' in bound:
                flags['fatal'] = tristate(bound['fatal'])
            elif unpacked:
                flags['fatal'] = 'dynamic'
            else:
                fatal = callee.defaults.get('fatal')
                flags['fatal'] = 'yes' if fatal is None else tristate(fatal)
        if 'cause' in bound and not is_constant(bound['cause'], None):
            flags['cause'] = True
        if Extractor.on_http_error(chain, site):
            flags['onHttpError'] = True
        if 'metadata_available' in bound:
            flags['metadataAvailable'] = tristate(bound['metadata_available'])
        if name == 'raise_login_required':
            method = bound.get('method')
            if method is None:
                flags['loginMethod'] = 'dynamic' if unpacked else 'default'
            elif isinstance(method, ast.Constant) and method.value in LOGIN_METHODS:
                flags['loginMethod'] = method.value
            else:
                flags['loginMethod'] = 'dynamic'
        return flags

    @staticmethod
    def on_http_error(chain, site):
        """Whether the site runs only on an HTTP error: inside an `except` for one,
        on the branch of an `if` whose test implies one, or behind one in a
        short-circuited condition."""
        inner = site
        for node in chain:
            if isinstance(node, ast.ExceptHandler) and node.type is not None and HTTP_CHECK.search(ast.unparse(node.type)):
                return True
            if isinstance(node, ast.If) and inner is not node.test:
                in_body = any(stmt is inner for stmt in node.body)
                if http_when(node.test) == in_body:
                    return True
            if isinstance(node, ast.BoolOp) and inner in node.values:
                before = node.values[:node.values.index(inner)]
                # `a and b`: b runs only when a is true; `a or b`: only when a is false.
                if any(http_when(v) is isinstance(node.op, ast.And) for v in before):
                    return True
            inner = node
        return False

    @staticmethod
    def ancestors(node, parents):
        chain = []
        while node in parents:
            node = parents[node]
            chain.append(node)
        return chain

    @staticmethod
    def scope_name(chain):
        names = [n.name for n in reversed(chain) if isinstance(n, (ast.ClassDef, ast.FunctionDef, ast.AsyncFunctionDef))]
        return '.'.join(names) or '<module>'

    @staticmethod
    def extractor_name(chain):
        cls = next((n for n in reversed(chain) if isinstance(n, ast.ClassDef)), None)
        if cls is None:
            return None
        for stmt in cls.body:
            if isinstance(stmt, ast.Assign) and any(isinstance(t, ast.Name) and t.id == 'IE_NAME' for t in stmt.targets) and isinstance(stmt.value, ast.Constant) and isinstance(stmt.value.value, str):
                return stmt.value.value
        return cls.name[:-2] if cls.name.endswith('IE') else None


def main():
    tree = Tree(Path(sys.argv[1]))
    sites = Extractor(tree).run()
    # A pipe on Windows defaults to the legacy code page, which can't hold the
    # non-ASCII messages yt-dlp carries.
    sys.stdout.reconfigure(encoding='utf-8')
    json.dump({'schemaVersion': 1, 'files': tree.files, 'parseFailures': tree.failures, 'sites': sites}, sys.stdout, ensure_ascii=False)


if __name__ == '__main__':
    main()
