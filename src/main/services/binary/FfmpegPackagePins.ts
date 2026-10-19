import type {FfmpegPackageEntry} from '@shared/types.js'

// The approved FFmpeg packages, one per platform. Arroxy installs whichever
// matches the machine, once, and keeps using it across app updates until a
// newer approval lands here.
//
// These pins are the only place an FFmpeg version is chosen. The runtime index
// generator copies them into every signed v2 index unchanged, and the bundled
// fallback index ships them in the app, so a version changes only through a
// reviewed commit to this file. To approve another build, follow
// dev-docs/ffmpeg-packages.md: build the packages, publish them as a new
// non-latest release, then replace these entries.
export const FFMPEG_PACKAGE_PINS: readonly FfmpegPackageEntry[] = [
	{
		id: 'ffmpeg',
		version: 'N-126342-gf88b741dbf-20260831',
		platform: 'win32',
		arch: 'x64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19/arroxy-ffmpeg-win32-x64.tar.br',
		mirrors: [],
		size: 42369552,
		sha256: '848894ba34d2db2b78267b1f37d37b2814f4b2e318ade1d38280a7db1ebb7ac7',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg.exe',
		ffprobePath: 'ffprobe.exe',
		files: [
			{path: 'avcodec-63.dll', size: 98931712},
			{path: 'avdevice-63.dll', size: 3923968},
			{path: 'avfilter-12.dll', size: 35890176},
			{path: 'avformat-63.dll', size: 23118336},
			{path: 'avutil-61.dll', size: 2953728},
			{path: 'ffmpeg.exe', size: 548352},
			{path: 'ffprobe.exe', size: 227328},
			{path: 'NOTICE.txt', size: 889},
			{path: 'swresample-7.dll', size: 725504},
			{path: 'swscale-10.dll', size: 2519552}
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
		version: 'N-126342-gf88b741dbf-20260831',
		platform: 'linux',
		arch: 'x64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19/arroxy-ffmpeg-linux-x64.tar.br',
		mirrors: [],
		size: 43928077,
		sha256: 'f684996973842795eb1cdd34655cc6b2e0fee7d69f58e888bb4a2876eaaa66d1',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 497880},
			{path: 'ffprobe', size: 215184},
			{path: 'libavcodec.so.63.8.101', size: 98993200},
			{path: 'libavdevice.so.63.2.100', size: 5467720},
			{path: 'libavfilter.so.12.4.100', size: 36229504},
			{path: 'libavformat.so.63.6.100', size: 25699840},
			{path: 'libavutil.so.61.6.100', size: 8393416},
			{path: 'libswresample.so.7.2.100', size: 498632},
			{path: 'libswscale.so.10.2.100', size: 2406360},
			{path: 'NOTICE.txt', size: 889}
		],
		links: [
			{path: 'libavcodec.so', target: 'libavcodec.so.63.8.101'},
			{path: 'libavcodec.so.63', target: 'libavcodec.so.63.8.101'},
			{path: 'libavdevice.so', target: 'libavdevice.so.63.2.100'},
			{path: 'libavdevice.so.63', target: 'libavdevice.so.63.2.100'},
			{path: 'libavfilter.so', target: 'libavfilter.so.12.4.100'},
			{path: 'libavfilter.so.12', target: 'libavfilter.so.12.4.100'},
			{path: 'libavformat.so', target: 'libavformat.so.63.6.100'},
			{path: 'libavformat.so.63', target: 'libavformat.so.63.6.100'},
			{path: 'libavutil.so', target: 'libavutil.so.61.6.100'},
			{path: 'libavutil.so.61', target: 'libavutil.so.61.6.100'},
			{path: 'libswresample.so', target: 'libswresample.so.7.2.100'},
			{path: 'libswresample.so.7', target: 'libswresample.so.7.2.100'},
			{path: 'libswscale.so', target: 'libswscale.so.10.2.100'},
			{path: 'libswscale.so.10', target: 'libswscale.so.10.2.100'}
		]
	},
	{
		id: 'ffmpeg',
		version: 'N-126342-gf88b741dbf-20260831',
		platform: 'linux',
		arch: 'arm64',
		url: 'https://github.com/antonio-orionus/arroxy-runtime-binaries/releases/download/ffmpeg-2026.10.19/arroxy-ffmpeg-linux-arm64.tar.br',
		mirrors: [],
		size: 39477893,
		sha256: '1b95913c329bffba359a4c11feefb0683070dc51215c05a3835dca52c7b80273',
		format: 'tar.br',
		ffmpegPath: 'ffmpeg',
		ffprobePath: 'ffprobe',
		files: [
			{path: 'ffmpeg', size: 526544},
			{path: 'ffprobe', size: 264360},
			{path: 'libavcodec.so.63.8.101', size: 68905032},
			{path: 'libavdevice.so.63.2.100', size: 5268192},
			{path: 'libavfilter.so.12.4.100', size: 29562784},
			{path: 'libavformat.so.63.6.100', size: 21995592},
			{path: 'libavutil.so.61.6.100', size: 6106792},
			{path: 'libswresample.so.7.2.100', size: 330128},
			{path: 'libswscale.so.10.2.100', size: 1640728},
			{path: 'NOTICE.txt', size: 889}
		],
		links: [
			{path: 'libavcodec.so', target: 'libavcodec.so.63.8.101'},
			{path: 'libavcodec.so.63', target: 'libavcodec.so.63.8.101'},
			{path: 'libavdevice.so', target: 'libavdevice.so.63.2.100'},
			{path: 'libavdevice.so.63', target: 'libavdevice.so.63.2.100'},
			{path: 'libavfilter.so', target: 'libavfilter.so.12.4.100'},
			{path: 'libavfilter.so.12', target: 'libavfilter.so.12.4.100'},
			{path: 'libavformat.so', target: 'libavformat.so.63.6.100'},
			{path: 'libavformat.so.63', target: 'libavformat.so.63.6.100'},
			{path: 'libavutil.so', target: 'libavutil.so.61.6.100'},
			{path: 'libavutil.so.61', target: 'libavutil.so.61.6.100'},
			{path: 'libswresample.so', target: 'libswresample.so.7.2.100'},
			{path: 'libswresample.so.7', target: 'libswresample.so.7.2.100'},
			{path: 'libswscale.so', target: 'libswscale.so.10.2.100'},
			{path: 'libswscale.so.10', target: 'libswscale.so.10.2.100'}
		]
	}
]
