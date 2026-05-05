import { initialize as aptabaseInit, trackEvent } from '@aptabase/electron/main';

type Props = Record<string, string | number | boolean>;
type CrashReason = 'clean-exit' | 'abnormal-exit' | 'killed' | 'crashed' | 'oom' | 'launch-failed' | 'integrity-failure' | 'memory-eviction';
type ChildProcessType = 'Utility' | 'Zygote' | 'Sandbox helper' | 'GPU' | 'Pepper Plugin' | 'Pepper Plugin Broker' | 'Unknown';
type RendererWindowRole = 'main-window' | 'auxiliary-window';

type CrashDetectedInput =
  | {
      kind: 'renderer';
      windowRole: RendererWindowRole;
      reason: Exclude<CrashReason, 'clean-exit'>;
    }
  | {
      kind: 'child';
      type: ChildProcessType;
      reason: Exclude<CrashReason, 'clean-exit'>;
      name?: string;
      serviceName?: string;
    };

// Allowlist: event name → permitted prop keys.
// Any call with an unknown event or disallowed key throws in dev and silently
// drops in prod, preventing accidental URL/path/title leakage.
const ALLOWED: Record<string, readonly string[]> = {
  app_started: ['install_channel', 'platform_arch', 'is_first_run'],
  update_available: ['to_version', 'install_channel'],
  update_install_clicked: ['install_channel'],
  format_probed: ['duration_bucket', 'error_category'],
  download_started: ['preset', 'has_subtitles', 'has_sponsorblock', 'cookies_enabled', 'embed_metadata', 'embed_thumbnail'],
  download_finished: ['outcome', 'duration_bucket', 'size_bucket', 'error_category'],
  tray_close_chosen: ['choice', 'remember'],
  binary_setup_failed: ['binary', 'phase'],
  crash_detected: ['type', 'reason'],
  wizard_started: []
};

const MAX_STR = 32;

let _dev = false;
let _started = false;
let _on = false;
const _seenCrashSignatures = new Set<string>();

// Must be called synchronously before app.isReady() so aptabase can register
// its custom protocol scheme before Electron locks the scheme registry.
//
// In dev we stay fully offline by default — HMR reloads would otherwise spam
// `wizard_started` / `app_started` and pollute prod stats. Set
// ARROXY_ANALYTICS_DEBUG=1 to opt in; events will be tagged debug-mode by the
// Aptabase SDK (app.isPackaged === false) so they're filterable on the dashboard.
export function setupAnalytics(appKey: string | undefined, isDev: boolean): void {
  _dev = isDev;
  _started = false;
  _on = false;
  _seenCrashSignatures.clear();
  if (!appKey) return;
  const debugOptIn = process.env.ARROXY_ANALYTICS_DEBUG === '1';
  if (isDev && !debugOptIn) return;
  void aptabaseInit(appKey);
  _started = true;
}

// Called after settings are loaded inside app.whenReady().
export function setAnalyticsEnabled(enabled: boolean): void {
  _on = enabled;
}

// --- Bucketing helpers ---

export function probeDurationBucket(ms: number): string {
  if (ms < 2_000) return '<2s';
  if (ms < 5_000) return '2-5s';
  if (ms < 15_000) return '5-15s';
  return '>15s';
}

export function downloadDurationBucket(ms: number): string {
  if (ms < 30_000) return '<30s';
  if (ms < 120_000) return '30s-2m';
  if (ms < 600_000) return '2-10m';
  if (ms < 1_800_000) return '10-30m';
  return '>30m';
}

export function sizeBucket(bytes: number): string {
  const MB = 1_048_576;
  if (bytes < 50 * MB) return '<50MB';
  if (bytes < 500 * MB) return '50-500MB';
  if (bytes < 2_048 * MB) return '500MB-2GB';
  return '>2GB';
}

// --- Core track function ---

export function trackMain(name: string, props?: Props): boolean {
  const keys = ALLOWED[name];
  if (keys === undefined) {
    if (_dev) throw new Error(`[analytics] unknown event: "${name}"`);
    return false;
  }
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (!keys.includes(k)) {
        if (_dev) throw new Error(`[analytics] prop "${k}" not allowed on event "${name}"`);
        return false;
      }
      if (typeof v === 'string' && v.length > MAX_STR) {
        if (_dev) throw new Error(`[analytics] prop "${k}" value too long (${v.length} > ${MAX_STR})`);
        return false;
      }
    }
  }
  if (!_started || !_on) return false;
  void trackEvent(name, props);
  return true;
}

function normalizeCrashSignaturePart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function crashSignature(input: CrashDetectedInput): string {
  if (input.kind === 'renderer') {
    return `renderer|${normalizeCrashSignaturePart(input.reason)}`;
  }

  return `child|${normalizeCrashSignaturePart(input.type)}|${normalizeCrashSignaturePart(input.reason)}`;
}

export function trackCrashDetectedOncePerSession(input: CrashDetectedInput): void {
  const signature = crashSignature(input);
  if (_seenCrashSignatures.has(signature)) return;

  const didTrack = input.kind === 'renderer' ? trackMain('crash_detected', { type: 'renderer', reason: input.reason }) : trackMain('crash_detected', { type: input.type, reason: input.reason });

  if (didTrack) {
    _seenCrashSignatures.add(signature);
  }
}
