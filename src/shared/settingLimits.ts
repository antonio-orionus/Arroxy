// The bounds of the numeric settings that decide how hard Arroxy works the
// network: request pacing, connections per download, downloads at once, and
// automatic retries.

import {z} from 'zod'

// Seconds between requests (yt-dlp's sleep options).
export const pacingSleepSecondsSchema = z.number().min(0).max(120)

// Parallel connections for one video's media transfer (yt-dlp
// `--concurrent-fragments`). 0 means off — a single connection, yt-dlp's own
// default. Capped because throughput saturates on the user's bandwidth well
// before this ceiling, while higher values only add rate-limit risk.
export const DOWNLOAD_CONNECTIONS_MAX = 16
export const downloadConnectionsSchema = z.number().int().min(0).max(DOWNLOAD_CONNECTIONS_MAX)

// How many queue items download simultaneously. Distinct from download
// connections, which widens a single item's transfer. Capped well below the
// point where parallel jobs stop helping and start reading as scripted
// traffic to the sites being downloaded from.
export const CONCURRENT_DOWNLOADS_MAX = 8
export const concurrentDownloadsSchema = z.number().int().min(1).max(CONCURRENT_DOWNLOADS_MAX)

// Automatic retries per queue item after a transient failure. 0 means off —
// failures wait for the user, which is the historical behavior. Bounded
// because an unbounded loop against a site that keeps refusing is
// indistinguishable from hammering it.
export const AUTO_RETRY_ATTEMPTS_MAX = 10
export const autoRetryAttemptsSchema = z.number().int().min(0).max(AUTO_RETRY_ATTEMPTS_MAX)
