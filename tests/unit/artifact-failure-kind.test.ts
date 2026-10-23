import {describe, expect, it} from 'vite-plus/test'
import {ArtifactMaterializeError, artifactErrorToDependencyFailureKind, downloadErrorToArtifactError} from '@main/services/binary/ArtifactInstall.js'
import {DownloadStalledError} from '@main/services/binary/BinaryDownloader.js'

describe('artifact failure kinds', () => {
	// The managed-download path: a stall became 'timeout' (ARX-008), whose copy
	// blames a first-run security scan on what is a slow or dropping connection.
	it('reports a managed download that stalled as download_stalled', () => {
		const err = downloadErrorToArtifactError('yt-dlp', 100, new DownloadStalledError('No download progress for 60000ms'))

		expect(artifactErrorToDependencyFailureKind(err)).toBe('download_stalled')
	})

	it('reports a download past its time limit as download_stalled', () => {
		const err = downloadErrorToArtifactError('ffmpeg', 100, new DownloadStalledError('Download exceeded 600000ms'))

		expect(artifactErrorToDependencyFailureKind(err)).toBe('download_stalled')
	})

	it('keeps waiting on another install’s lock as timeout', () => {
		expect(artifactErrorToDependencyFailureKind(new ArtifactMaterializeError('LOCK', 'Timed out waiting for artifact lock yt-dlp'))).toBe('timeout')
	})
})
