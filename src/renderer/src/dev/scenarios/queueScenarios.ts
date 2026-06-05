import { QUEUE_STATUS, STATUS_KEY } from '@shared/schemas.js';
import type { QueueItem } from '@shared/types.js';

interface ScenarioLike {
  id: string;
}

export function buildQueueItems(scenario: ScenarioLike): QueueItem[] {
  switch (scenario.id) {
    case 'queue-running':
      return [queueItem({ status: QUEUE_STATUS.running, progressPercent: 42, progressDetail: 'Downloading 42%' })];
    case 'queue-paused-active':
      return [queueItem({ status: QUEUE_STATUS.pausedActive, progressPercent: 38, progressDetail: 'Paused at 38%', tempDir: '/tmp/arroxy-mock', lastJobId: 'mock-job-1' })];
    case 'queue-paused-held':
      return [queueItem({ status: QUEUE_STATUS.pausedHeld, progressPercent: 0, progressDetail: null })];
    case 'queue-cancelled':
      return [queueItem({ status: QUEUE_STATUS.cancelled, progressPercent: 23, progressDetail: null, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-error':
      return [queueItem({ status: QUEUE_STATUS.error, progressPercent: 17, progressDetail: null, error: { kind: 'botBlock', raw: "Sign in to confirm you're not a bot" }, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-completed':
      return [queueItem({ status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-subtitles-failed':
      return [queueItem({ status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, lastStatus: { key: STATUS_KEY.subtitlesFailed }, finishedAt: '2026-05-31T12:00:00.000Z' })];
    case 'queue-multi':
      return buildMultiQueueItems();
    default:
      return [];
  }
}

function buildMultiQueueItems(): QueueItem[] {
  return [queueItem({ id: 'mq-1', title: 'Running Download - Lo-fi Hip Hop Radio', status: QUEUE_STATUS.running, progressPercent: 61, progressDetail: 'Downloading 61%' }), queueItem({ id: 'mq-2', title: 'Pending Item - Waiting in Queue', status: QUEUE_STATUS.pending, progressPercent: 0, progressDetail: null }), queueItem({ id: 'mq-3', title: 'Paused Held - Never Started', status: QUEUE_STATUS.pausedHeld, progressPercent: 0, progressDetail: null }), queueItem({ id: 'mq-4', title: 'Completed Download - Archive Recording', status: QUEUE_STATUS.done, progressPercent: 100, progressDetail: null, finishedAt: '2026-05-31T11:00:00.000Z' }), queueItem({ id: 'mq-5', title: 'Failed Download - Bot Block', status: QUEUE_STATUS.error, progressPercent: 12, progressDetail: null, error: { kind: 'botBlock', raw: "Sign in to confirm you're not a bot" }, finishedAt: '2026-05-31T10:30:00.000Z' }), queueItem({ id: 'mq-6', title: 'Cancelled Item - User Cancelled', status: QUEUE_STATUS.cancelled, progressPercent: 45, progressDetail: null, finishedAt: '2026-05-31T10:00:00.000Z' })];
}

function queueItem(overrides: Partial<QueueItem> & { id?: string }): QueueItem {
  return {
    id: overrides.id ?? 'scenario-queue-item',
    url: 'https://www.youtube.com/watch?v=scenario',
    title: 'Scenario Queue Item - visual regression fixture',
    thumbnail: 'https://i.ytimg.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    outputDir: '/home/user/Downloads',
    formatLabel: '1080p | mp4 | 30fps',
    status: QUEUE_STATUS.pending,
    lane: 'normal',
    progressPercent: 0,
    progressDetail: null,
    lastStatus: { key: STATUS_KEY.startingYtdlp },
    error: null,
    finishedAt: null,
    writeM3u: true,
    job: { kind: 'single-format', extractor: 'youtube', extractorKey: 'Youtube', formatId: '137+251', preset: 'custom', sponsorBlock: { mode: 'off' }, embed: { chapters: false, metadata: false, thumbnail: false, description: false, thumbnailSidecar: false } },
    ...overrides
  };
}
