"""Run one yt-dlp download and list every file it wrote, for the filename parity check.

Usage: download_runner.py <yt-dlp zipapp> <yt-dlp arguments...>

Runs yt-dlp's own CLI in this process, in the current working directory, and
records each path it opens for writing or renames a file to, as Python's audit
hooks report them. That is every name yt-dlp writes on the way to the finished
file: `.part` files, fragments, resume records, the moves out of the temp folder.
Prints {"code": <exit code>, "written": [<absolute paths>]} as the last line
of stdout, so the caller should pass --quiet.
"""

import json
import os
import sys

zipapp = sys.argv[1]
sys.path.insert(0, zipapp)

written = []
WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT


def record(event, args):
    if event == 'open':
        path, mode, flags = args
        writes = any(c in mode for c in 'wax+') if isinstance(mode, str) else bool(flags & WRITE_FLAGS)
        # The null device takes the output of yt-dlp's own subprocess probes.
        if isinstance(path, str) and writes and path != os.devnull:
            written.append(os.path.abspath(path))
    elif event == 'os.rename' and isinstance(args[1], str):
        written.append(os.path.abspath(args[1]))


sys.addaudithook(record)

import yt_dlp  # noqa: E402 -- imported after the hook so every open is seen

code = 0
try:
    yt_dlp.main(sys.argv[2:])
except SystemExit as exit_:
    code = exit_.code if isinstance(exit_.code, int) else 1
print(json.dumps({'code': code, 'written': sorted(set(written))}))
