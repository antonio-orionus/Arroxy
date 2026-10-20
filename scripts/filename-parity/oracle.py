"""yt-dlp's own output filename for each case, for the filename parity check.

Reads {"cases": [{"info_json", "output_args", "outtmpls", "paths"}]} as JSON on
stdin and writes one result per case as a JSON list. The first argument is the
pinned yt-dlp zipapp.

POSIX: each case runs the real CLI, `--load-info-json` plus the case's `-o` and
`--paths` arguments and `--print filename`, so the answer is what a download on
this machine would write. Nothing is fetched or downloaded.

Windows: expand_path cannot be run on Windows from here, so the same strings go
through yt-dlp's own `_outtmpl_expandpath` and `expand_path` with ntpath in
place of the host's os.path. A case passes there when expansion leaves every
string unchanged, which is all Arroxy relies on.
"""

import json
import ntpath
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor


def posix_filename(zipapp, case):
    argv = [sys.executable, zipapp, '--ignore-config', '--no-plugin-dirs', '--no-cache-dir',
            '--load-info-json', case['info_json'], '--print', 'filename', '--print', 'ext', *case['output_args']]
    run = subprocess.run(argv, capture_output=True, text=True, encoding='utf-8')
    lines = run.stdout.splitlines()
    if run.returncode != 0 or len(lines) != 2:
        return {'error': (run.stderr or run.stdout).strip()[-400:]}
    return {'filename': lines[0], 'ext': lines[1]}


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


def main():
    zipapp = sys.argv[1]
    cases = json.load(sys.stdin)['cases']
    with ThreadPoolExecutor(max_workers=8) as pool:
        posix = list(pool.map(lambda case: posix_filename(zipapp, case), cases))
    nt = nt_changes(zipapp, cases)
    json.dump([{'posix': p, 'nt': n} for p, n in zip(posix, nt)], sys.stdout)


if __name__ == '__main__':
    main()
