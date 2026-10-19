import {ARROXY_RUNTIME_BINARIES_REPO} from '@shared/runtimeBinaryManifest.js'

// v2 carries FFmpeg packages; v1 stays published, yt-dlp only, for 0.6.2 and
// earlier, whose parser rejects any other entry kind.
export const RUNTIME_BINARY_INDEX_FILE_NAME = 'runtime-index-v2.json'
export const RUNTIME_BINARY_INDEX_SIGNATURE_FILE_NAME = 'runtime-index-v2.sig'
export const RUNTIME_BINARY_INDEX_URL = `https://github.com/${ARROXY_RUNTIME_BINARIES_REPO}/releases/latest/download/${RUNTIME_BINARY_INDEX_FILE_NAME}`
export const RUNTIME_BINARY_INDEX_SIGNATURE_URL = `https://github.com/${ARROXY_RUNTIME_BINARIES_REPO}/releases/latest/download/${RUNTIME_BINARY_INDEX_SIGNATURE_FILE_NAME}`

export const RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEASwotnq/ABvF3TAJHHzcEIXTfbNF8hD8AzSL1oFrNGPw=
-----END PUBLIC KEY-----
`
