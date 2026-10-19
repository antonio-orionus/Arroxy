// Minimal stub of `electron` for unit tests. Only `app.isPackaged` is read by
// BinaryManager (devEmbeddedBinaryPath: release builds bundle no FFmpeg).
export const app = {isPackaged: false}
