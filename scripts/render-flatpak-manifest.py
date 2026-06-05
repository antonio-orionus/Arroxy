#!/usr/bin/env python3

import argparse
import subprocess
from pathlib import Path

MAX_RELEASES = 10


def render_template(
    template_path: Path, output_path: Path, replacements: dict[str, str]
) -> None:
    content = template_path.read_text(encoding="utf-8")
    for token, value in replacements.items():
        content = content.replace(token, value)

    missing = [token for token in replacements if token in content]
    if missing:
        raise SystemExit(
            f"Unreplaced template tokens remain in {template_path}: {', '.join(missing)}"
        )

    output_path.write_text(content, encoding="utf-8")


def collect_releases() -> list[tuple[str, str]]:
    cmd = [
        "git",
        "for-each-ref",
        "refs/tags/v*",
        "--sort=-v:refname",
        "--format=%(refname:short)|%(taggerdate:short)|%(committerdate:short)",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise SystemExit(
            f"git for-each-ref failed (exit {result.returncode})\n"
            f"  cmd: {' '.join(cmd)}\n"
            f"  stdout: {result.stdout!r}\n"
            f"  stderr: {result.stderr!r}"
        )
    pairs: list[tuple[str, str]] = []
    for line in result.stdout.splitlines():
        if not line.strip():
            continue
        tag, tagger_date, committer_date = line.split("|", 2)
        date = tagger_date.strip() or committer_date.strip()
        if not date:
            continue
        pairs.append((tag, date))
        if len(pairs) >= MAX_RELEASES:
            break
    if not pairs:
        raise SystemExit("No v* tags found — cannot render <releases> block.")
    return pairs


def render_releases_block(pairs: list[tuple[str, str]], indent: str = "    ") -> str:
    lines: list[str] = []
    for tag, date in pairs:
        version = tag.lstrip("v")
        rel_type = "development" if "-" in version else "stable"
        lines.append(
            f'{indent}<release version="{version}" date="{date}" type="{rel_type}"/>'
        )
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Render Flatpak manifest + metainfo from checked-in templates."
    )
    parser.add_argument("--sha256", required=True, help="SHA256 of the Arroxy Linux tarball")
    parser.add_argument(
        "--archive-path",
        required=True,
        help="Path to the local Arroxy Linux tarball, relative to the manifest directory",
    )
    parser.add_argument(
        "--template",
        default="flatpak/io.github.antonio_orionus.Arroxy.yml.in",
        help="Manifest template path",
    )
    parser.add_argument(
        "--output",
        default="flatpak/io.github.antonio_orionus.Arroxy.yml",
        help="Rendered manifest path",
    )
    parser.add_argument(
        "--metainfo-template",
        default=None,
        help="Metainfo template path. Must be provided together with --metainfo-output.",
    )
    parser.add_argument(
        "--metainfo-output",
        default=None,
        help="Rendered metainfo path. Must be provided together with --metainfo-template.",
    )
    args = parser.parse_args()

    render_template(
        Path(args.template),
        Path(args.output),
        {
            "__ARCHIVE_PATH__": args.archive_path,
            "__ARCHIVE_SHA256__": args.sha256,
        },
    )

    if args.metainfo_template or args.metainfo_output:
        if not (args.metainfo_template and args.metainfo_output):
            raise SystemExit(
                "--metainfo-template and --metainfo-output must be provided together."
            )
        releases_block = render_releases_block(collect_releases())
        render_template(
            Path(args.metainfo_template),
            Path(args.metainfo_output),
            {"__RELEASES__": releases_block},
        )

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
