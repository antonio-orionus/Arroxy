import {z} from 'zod'
import {timestampSchema} from './views'

// The file that tells a local client where the app listens. It lives in the
// app's userData folder, which is owner-only on every OS, is rewritten on each
// launch, and is deleted on a clean quit. It carries no pid: under Flatpak the
// app's pid is 2 (the host's kthreadd), so a client checks liveness by
// connecting, and a file left by a crash simply fails that probe.
export const CONTROL_DISCOVERY_FILE_NAME = 'control.json'

export const controlDiscoverySchema = z.object({
	// A Unix socket path, or a Windows named pipe (`\\.\pipe\...`).
	socketPath: z.string().min(1),
	// Keys the handshake proofs; it never crosses the socket itself.
	token: z.string().min(1),
	// The app version that wrote the file.
	version: z.string().min(1),
	startedAt: timestampSchema
})
export type ControlDiscovery = z.infer<typeof controlDiscoverySchema>
