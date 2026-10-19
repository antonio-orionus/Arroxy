import type {FfmpegPackageEntry} from '@shared/types.js'

// The approved FFmpeg packages, one per platform. Arroxy installs whichever
// matches the machine, once, and keeps using it across app updates until a
// newer approval lands here.
//
// These pins are the only place an FFmpeg version is chosen. The runtime index
// generator copies them into every signed v2 index unchanged, and the bundled
// fallback index ships them in the app, so a version changes only through a
// reviewed commit to this file (gate test). To approve another build, follow
// dev-docs/ffmpeg-packages.md: build the packages, publish them as a new
// non-latest release, then replace these entries.
export const FFMPEG_PACKAGE_PINS: readonly FfmpegPackageEntry[] = [
	{
		id: 'ffmpeg',
		version: 'n9.0.2-17-g2a571b6068',
		platform: 'win32',
		arch: 'x64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19.2/arroxy-ffmpeg-win32-x64.tar.br',
		mirrors: [],
		size: 47997184,
		sha256: '5e574d7b4316b8cbdffe62fa6f56f3d73145efc71a4e6bac1eb11817cda7f2d6',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg.exe',
		ffprobePath: 'ffprobe.exe',
		files: [
			{path: 'avcodec-63.dll', size: 119112704},
			{path: 'avdevice-63.dll', size: 4948480},
			{path: 'avfilter-12.dll', size: 36996096},
			{path: 'avformat-63.dll', size: 23009792},
			{path: 'avutil-61.dll', size: 3016704},
			{path: 'ffmpeg.exe', size: 540160},
			{path: 'ffprobe.exe', size: 229888},
			{path: 'NOTICE.txt', size: 889},
			{path: 'swresample-7.dll', size: 734720},
			{path: 'swscale-10.dll', size: 2332160}
		],
		links: []
	},
	{
		id: 'ffmpeg',
		version: '9.0.2',
		platform: 'darwin',
		arch: 'x64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19/arroxy-ffmpeg-darwin-x64.tar.br',
		mirrors: [],
		size: 27573341,
		sha256: '2d08bdd83fc755792ce73dc47f50568a8fd819c025f3e900ec24181e0f37af22',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 94769296},
			{path: 'ffprobe', size: 94594080},
			{path: 'NOTICE.txt', size: 889}
		],
		links: []
	},
	{
		id: 'ffmpeg',
		version: '9.0.2',
		platform: 'darwin',
		arch: 'arm64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19/arroxy-ffmpeg-darwin-arm64.tar.br',
		mirrors: [],
		size: 22453678,
		sha256: 'f5b663baf2842eee491e6342dbbb70e573b545e0672bc0031afb872da3e1da3e',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 66332880},
			{path: 'ffprobe', size: 66158064},
			{path: 'NOTICE.txt', size: 889}
		],
		links: []
	},
	{
		id: 'ffmpeg',
		version: 'n9.0.2-17-g2a571b6068',
		platform: 'linux',
		arch: 'x64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19.2/arroxy-ffmpeg-linux-x64.tar.br',
		mirrors: [],
		size: 50907555,
		sha256: 'd297ba99a735bddc340579cd0d3366393f9bf40dc72fa09f0c4e6fbe67b7053d',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 510168},
			{path: 'ffprobe', size: 227472},
			{path: 'libavcodec.so.63.1.102', size: 119947888},
			{path: 'libavdevice.so.63.1.102', size: 5688608},
			{path: 'libavfilter.so.12.1.102', size: 38088096},
			{path: 'libavformat.so.63.1.102', size: 26275224},
			{path: 'libavutil.so.61.1.102', size: 8617640},
			{path: 'libswresample.so.7.1.102', size: 502728},
			{path: 'libswscale.so.10.1.102', size: 2250712},
			{path: 'NOTICE.txt', size: 889}
		],
		links: [
			{path: 'libavcodec.so', target: 'libavcodec.so.63.1.102'},
			{path: 'libavcodec.so.63', target: 'libavcodec.so.63.1.102'},
			{path: 'libavdevice.so', target: 'libavdevice.so.63.1.102'},
			{path: 'libavdevice.so.63', target: 'libavdevice.so.63.1.102'},
			{path: 'libavfilter.so', target: 'libavfilter.so.12.1.102'},
			{path: 'libavfilter.so.12', target: 'libavfilter.so.12.1.102'},
			{path: 'libavformat.so', target: 'libavformat.so.63.1.102'},
			{path: 'libavformat.so.63', target: 'libavformat.so.63.1.102'},
			{path: 'libavutil.so', target: 'libavutil.so.61.1.102'},
			{path: 'libavutil.so.61', target: 'libavutil.so.61.1.102'},
			{path: 'libswresample.so', target: 'libswresample.so.7.1.102'},
			{path: 'libswresample.so.7', target: 'libswresample.so.7.1.102'},
			{path: 'libswscale.so', target: 'libswscale.so.10.1.102'},
			{path: 'libswscale.so.10', target: 'libswscale.so.10.1.102'}
		]
	},
	{
		id: 'ffmpeg',
		version: 'n9.0.2-17-g2a571b6068',
		platform: 'linux',
		arch: 'arm64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19.2/arroxy-ffmpeg-linux-arm64.tar.br',
		mirrors: [],
		size: 44671961,
		sha256: '54d5e87c98e2b5afe390675374d315e07e3ca07bf8245840fc4f6c72ffec8d7a',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 526656},
			{path: 'ffprobe', size: 264448},
			{path: 'libavcodec.so.63.1.102', size: 87137008},
			{path: 'libavdevice.so.63.1.102', size: 5399376},
			{path: 'libavfilter.so.12.1.102', size: 30349240},
			{path: 'libavformat.so.63.1.102', size: 21665848},
			{path: 'libavutil.so.61.1.102', size: 6379528},
			{path: 'libswresample.so.7.1.102', size: 330240},
			{path: 'libswscale.so.10.1.102', size: 1574920},
			{path: 'NOTICE.txt', size: 889}
		],
		links: [
			{path: 'libavcodec.so', target: 'libavcodec.so.63.1.102'},
			{path: 'libavcodec.so.63', target: 'libavcodec.so.63.1.102'},
			{path: 'libavdevice.so', target: 'libavdevice.so.63.1.102'},
			{path: 'libavdevice.so.63', target: 'libavdevice.so.63.1.102'},
			{path: 'libavfilter.so', target: 'libavfilter.so.12.1.102'},
			{path: 'libavfilter.so.12', target: 'libavfilter.so.12.1.102'},
			{path: 'libavformat.so', target: 'libavformat.so.63.1.102'},
			{path: 'libavformat.so.63', target: 'libavformat.so.63.1.102'},
			{path: 'libavutil.so', target: 'libavutil.so.61.1.102'},
			{path: 'libavutil.so.61', target: 'libavutil.so.61.1.102'},
			{path: 'libswresample.so', target: 'libswresample.so.7.1.102'},
			{path: 'libswresample.so.7', target: 'libswresample.so.7.1.102'},
			{path: 'libswscale.so', target: 'libswscale.so.10.1.102'},
			{path: 'libswscale.so.10', target: 'libswscale.so.10.1.102'}
		]
	}
]
