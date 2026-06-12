#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ "${1:-}" == "--" ]]; then
	shift
fi

if (( $# == 0 )); then
	set -- bun run dev
fi

LOCAL_MANIFEST_DIR="$ROOT/dist/runtime-binaries/local"
LOCAL_MANIFEST_FILE="$LOCAL_MANIFEST_DIR/runtime-index-v1.json"
LOCAL_SIGNATURE_FILE="$LOCAL_MANIFEST_DIR/runtime-index-v1.sig"
LOCAL_PUBLIC_KEY_FILE="$LOCAL_MANIFEST_DIR/runtime-index-local.public.pem"

if [[ ! -s "$LOCAL_MANIFEST_FILE" || ! -s "$LOCAL_SIGNATURE_FILE" || ! -s "$LOCAL_PUBLIC_KEY_FILE" ]]; then
	bun run runtime-manifest:local
else
	echo "Using existing local runtime manifest: $LOCAL_MANIFEST_FILE"
fi

export ARROXY_RUNTIME_INDEX_FILE="$LOCAL_MANIFEST_FILE"
export ARROXY_RUNTIME_INDEX_SIG_FILE="$LOCAL_SIGNATURE_FILE"
export ARROXY_RUNTIME_INDEX_PUBLIC_KEY_FILE="$LOCAL_PUBLIC_KEY_FILE"
export ARROXY_RUNTIME_INDEX_URL='off'
export ARROXY_RUNTIME_INDEX_SIG_URL='off'

exec "$@"
