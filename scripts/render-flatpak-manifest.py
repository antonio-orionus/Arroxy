#!/usr/bin/env python3

import argparse
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Render the Flatpak manifest from a checked-in template."
    )
    parser.add_argument("--version", required=True, help="Release version, with or without leading v")
    parser.add_argument("--sha256", required=True, help="SHA256 of Arroxy-<version>.tar.gz")
    parser.add_argument(
        "--template",
        default="flatpak/io.github.antonio_orionus.Arroxy.yml.in",
        help="Template manifest path",
    )
    parser.add_argument(
        "--output",
        default="flatpak/io.github.antonio_orionus.Arroxy.yml",
        help="Rendered manifest path",
    )
    parser.add_argument(
        "--repository",
        default="antonio-orionus/Arroxy",
        help="GitHub repository that hosts the release assets",
    )
    args = parser.parse_args()

    version = args.version[1:] if args.version.startswith("v") else args.version
    tag = f"v{version}"
    archive_url = (
        f"https://github.com/{args.repository}/releases/download/{tag}/Arroxy-{version}.tar.gz"
    )

    template_path = Path(args.template)
    output_path = Path(args.output)
    content = template_path.read_text(encoding="utf-8")
    content = content.replace("__ARCHIVE_URL__", archive_url)
    content = content.replace("__ARCHIVE_SHA256__", args.sha256)

    missing_tokens = [
        token
        for token in ("__ARCHIVE_URL__", "__ARCHIVE_SHA256__")
        if token in content
    ]
    if missing_tokens:
        raise SystemExit(
            f"Unreplaced Flatpak manifest tokens remain: {', '.join(missing_tokens)}"
        )

    output_path.write_text(content, encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
