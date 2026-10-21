"""yt-dlp's own output filename for each case, for the filename parity check.

Reads {"cases": [{"cwd", "info_json", "output_args", "outtmpls", "paths", "report"}],
"downloads": [{"cwd", "info_json", "format", "output_args"}]} as JSON on stdin and
writes {"cases": [...], "downloads": [...]}, one result per entry. The first
argument is the pinned yt-dlp zipapp.

POSIX: each case runs the real CLI in the case's working directory,
`--load-info-json` plus the case's `-o`, `--paths` and `--print-to-file`
arguments and `--print filename`, so the answer is what a download on this
machine would write. A report file the case names must then exist. Nothing is
fetched or downloaded.

Windows: expand_path cannot be run on Windows from here, so the same strings go
through yt-dlp's own `_outtmpl_expandpath` and `expand_path` with ntpath in
place of the host's os.path. A case passes there when expansion leaves every
string unchanged, which is all Arroxy relies on.

Downloads: the names yt-dlp writes while downloading (`.f<format_id>`, `.part`,
fragments) are longer than the finished one, and only a download shows them.
Each download case really downloads its formats, as HLS streams of twelve
zero-filled segments served by this process on 127.0.0.1, with no ffmpeg so
nothing is merged. download_runner.py lists every file yt-dlp wrote.
"""

import json
import ntpath
import os
import subprocess
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

RUNNER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'download_runner.py')
SEGMENTS = 12  # two-digit fragment indexes
SEGMENT = b'\0' * 188  # one MPEG-TS packet's worth


class LocalStreams(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_GET(self):
        if self.path.endswith('.m3u8'):
            lines = ['#EXTM3U', '#EXT-X-VERSION:3', '#EXT-X-TARGETDURATION:1']
            for index in range(SEGMENTS):
                lines += ['#EXTINF:1.0,', f'/segment/{index}.ts']
            body = '\n'.join([*lines, '#EXT-X-ENDLIST', '']).encode()
            content_type = 'application/vnd.apple.mpegurl'
        else:
            body, content_type = SEGMENT, 'video/mp2t'
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def posix_filename(zipapp, case):
    argv = [sys.executable, zipapp, '--ignore-config', '--no-plugin-dirs', '--no-cache-dir',
            '--load-info-json', case['info_json'], '--print', 'filename', '--print', 'ext', *case['output_args']]
    run = subprocess.run(argv, capture_output=True, text=True, encoding='utf-8', cwd=case['cwd'])
    lines = run.stdout.splitlines()
    if run.returncode != 0 or len(lines) != 2:
        return {'error': (run.stderr or run.stdout).strip()[-400:]}
    result = {'filename': os.path.join(case['cwd'], lines[0]), 'ext': lines[1]}
    if case['report'] is not None:
        result['report_written'] = os.path.isfile(case['report'])
    return result


def nt_changes(zipapp, cases):
    sys.path.insert(0, zipapp)
    import yt_dlp.YoutubeDL  # noqa: F401 -- the package re-exports the class under the module's name
    ydl_module = sys.modules['yt_dlp.YoutubeDL']

    def nt_expand_path(s):
        return ntpath.expandvars(ntpath.expanduser(s))

    ydl_module.expand_path = nt_expand_path
    expand_outtmpl = ydl_module.YoutubeDL._outtmpl_expandpath
    results = []
    for case in cases:
        changed = [f'-o {o!r} -> {expand_outtmpl(o)!r}' for o in case['outtmpls'] if expand_outtmpl(o) != o]
        changed += [f'--paths {p!r} -> {nt_expand_path(p)!r}' for p in case['paths'] if nt_expand_path(p.strip()) != p.strip()]
        results.append(changed)
    return results


def written_files(zipapp, download, port):
    with open(download['info_json'], encoding='utf-8') as file:
        info = json.load(file)
    for index, fmt in enumerate(info['formats']):
        fmt['url'] = f'http://127.0.0.1:{port}/{index}.m3u8'
        fmt['protocol'] = 'm3u8_native'
    served = f"{download['info_json']}.served.json"
    with open(served, 'w', encoding='utf-8') as file:
        json.dump(info, file)
    argv = [sys.executable, RUNNER, zipapp, '--ignore-config', '--no-plugin-dirs', '--no-cache-dir', '--quiet', '--no-progress',
            '--fixup', 'never', '--ffmpeg-location', os.path.join(download['cwd'], 'no-ffmpeg'),
            '--load-info-json', served, '-f', download['format'], *download['output_args']]
    run = subprocess.run(argv, capture_output=True, text=True, encoding='utf-8', cwd=download['cwd'])
    lines = run.stdout.splitlines()
    try:
        result = json.loads(lines[-1])
    except (IndexError, ValueError):
        return {'error': (run.stderr or run.stdout).strip()[-400:]}
    if result['code'] != 0:
        result['error'] = run.stderr.strip()[-400:]
    return result


def main():
    zipapp = sys.argv[1]
    request = json.load(sys.stdin)
    cases, downloads = request['cases'], request['downloads']
    server = ThreadingHTTPServer(('127.0.0.1', 0), LocalStreams)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with ThreadPoolExecutor(max_workers=8) as pool:
            posix = list(pool.map(lambda case: posix_filename(zipapp, case), cases))
            written = list(pool.map(lambda download: written_files(zipapp, download, server.server_address[1]), downloads))
    finally:
        server.shutdown()
    nt = nt_changes(zipapp, cases)
    json.dump({'cases': [{'posix': p, 'nt': n} for p, n in zip(posix, nt)], 'downloads': written}, sys.stdout)


if __name__ == '__main__':
    main()
