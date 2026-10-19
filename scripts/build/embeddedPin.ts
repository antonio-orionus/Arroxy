import {BTBN_PINNED_RELEASE_TAG, BTBN_RELEASE_BRANCH, nonBlank} from './btbnResolver.js'

// Martin Riedl's macOS builds: one pinned release build per arch, two ZIPs
// each. Scraping the index for the newest snapshot gave every build whatever
// upstream published that day (a June nightly segfaulted on MP4 merges, and
// amd64 snapshots stopped updating), so the approved build and its SHA-256s
// are pinned here. Bump together with the FFmpeg package pins.
const MARTIN_RIEDL_PINS = {
	arm64: {path: '/download/macos/arm64/1789931890_9.0.2/', ffmpegSha: 'c8ed4c4e6978a03c485edbfe4e0a5dc2380f8a30bba5150531b31b094492d924', ffprobeSha: 'fcbe839537485eaee7a7a8bc5cbc0f90d53617e80943e8a5b2e31cb851197ea6'},
	x64: {path: '/download/macos/amd64/1789931006_9.0.2/', ffmpegSha: '7c6b4125b191cbf773832dc51f424cf2b6bb7da43007d1e066f95909e47cacd4', ffprobeSha: '2322438ed2f6319a691291b247d09c69dcaa3a982460d1f269a7e1af335cfdfd'}
} as const

type PinPlatform = 'win32' | 'darwin' | 'linux'
type PinArch = 'x64' | 'arm64'

// Names the upstream build a dev payload in build/embedded/ was fetched from.
// fetch-embedded.sh records it next to the binaries, and the payload check
// refetches when the record and the current pin differ, so a pin bump reaches
// existing checkouts instead of only fresh ones. Computed offline: the BtbN
// asset name needs the GitHub API, the tag and branch do not.
export function embeddedPinFor(platform: PinPlatform, arch: PinArch, env: NodeJS.ProcessEnv = process.env): string {
	if (platform === 'darwin') {
		const pin = MARTIN_RIEDL_PINS[arch]
		return `martin-riedl ${pin.path} ffmpeg=${pin.ffmpegSha} ffprobe=${pin.ffprobeSha}`
	}
	// Same override the resolver honours, so the record names what was fetched.
	const tag = nonBlank(env.BTBN_RELEASE_TAG) ?? BTBN_PINNED_RELEASE_TAG
	return `btbn ${tag} release/${BTBN_RELEASE_BRANCH}`
}

// The Martin Riedl pin as shell assignments for fetch-embedded.sh to source.
export function martinRiedlShellEnv(arch: PinArch): string {
	const pin = MARTIN_RIEDL_PINS[arch]
	return [`MARTIN_RIEDL_PATH='${pin.path}'`, `MARTIN_RIEDL_FFMPEG_SHA='${pin.ffmpegSha}'`, `MARTIN_RIEDL_FFPROBE_SHA='${pin.ffprobeSha}'`].join('\n') + '\n'
}
