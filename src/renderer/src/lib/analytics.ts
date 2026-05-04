// Thin renderer wrapper. All allowlist enforcement and the enabled flag live
// in the main process; this just forwards over IPC.
export function track(name: string, props?: Record<string, string | number | boolean>): void {
  window.appApi.analytics.track(name, props);
}
