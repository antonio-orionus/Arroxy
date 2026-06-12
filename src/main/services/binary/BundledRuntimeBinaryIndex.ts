import type {RuntimeBinaryIndex} from '@shared/types.js'

const YT_DLP_VERSION = '2026.06.09'
const YT_DLP_RELEASE = `https://github.com/yt-dlp/yt-dlp/releases/download/${YT_DLP_VERSION}`

export const BUNDLED_RUNTIME_BINARY_INDEX: RuntimeBinaryIndex = {
	schemaVersion: 1,
	generatedAt: '2026-06-12T00:00:00.000Z',
	entries: [
		{id: 'yt-dlp', channel: 'stable', provider: 'github', version: YT_DLP_VERSION, platform: 'win32', arch: 'x64', url: `${YT_DLP_RELEASE}/yt-dlp.exe`, mirrors: [], size: 18202192, sha256: '3a48cb955d55c8821b60ccbdbbc6f61bc958f2f3d3b7ad5eaf3d83a543293a27', format: 'raw', executablePath: 'yt-dlp.exe'},
		{id: 'yt-dlp', channel: 'stable', provider: 'github', version: YT_DLP_VERSION, platform: 'win32', arch: 'arm64', url: `${YT_DLP_RELEASE}/yt-dlp.exe`, mirrors: [], size: 18202192, sha256: '3a48cb955d55c8821b60ccbdbbc6f61bc958f2f3d3b7ad5eaf3d83a543293a27', format: 'raw', executablePath: 'yt-dlp.exe'},
		{id: 'yt-dlp', channel: 'stable', provider: 'github', version: YT_DLP_VERSION, platform: 'darwin', arch: 'x64', url: `${YT_DLP_RELEASE}/yt-dlp_macos`, mirrors: [], size: 36478448, sha256: 'b82c3626952e6c14eaf654cc565866775ffd0b9ffb7021628ac59b42c2f4f244', format: 'raw', executablePath: 'yt-dlp'},
		{id: 'yt-dlp', channel: 'stable', provider: 'github', version: YT_DLP_VERSION, platform: 'darwin', arch: 'arm64', url: `${YT_DLP_RELEASE}/yt-dlp_macos`, mirrors: [], size: 36478448, sha256: 'b82c3626952e6c14eaf654cc565866775ffd0b9ffb7021628ac59b42c2f4f244', format: 'raw', executablePath: 'yt-dlp'},
		{id: 'yt-dlp', channel: 'stable', provider: 'github', version: YT_DLP_VERSION, platform: 'linux', arch: 'x64', url: `${YT_DLP_RELEASE}/yt-dlp_linux`, mirrors: [], size: 39875976, sha256: 'bf8aac79b72287a6d2043074415132558b43743a8f9461a22b0141e90f16ce66', format: 'raw', executablePath: 'yt-dlp'},
		{id: 'yt-dlp', channel: 'stable', provider: 'github', version: YT_DLP_VERSION, platform: 'linux', arch: 'arm64', url: `${YT_DLP_RELEASE}/yt-dlp_linux_aarch64`, mirrors: [], size: 39628336, sha256: 'cabd246445bdfde0eda0dfe68bbe90354be83f3fdbbf077df11a2ea55f41cdbd', format: 'raw', executablePath: 'yt-dlp'}
	]
}
