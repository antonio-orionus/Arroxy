import type { PlaylistScope } from './schemas.js';

export interface PlaylistScopeLogFields {
  kind: PlaylistScope['items']['kind'];
  requestedCount: number;
  sentinel: boolean;
  ytDlpFlag: '--playlist-end' | '--playlist-items';
  ytDlpValue: string;
  appLimit?: number;
  from?: number;
  to?: number;
}

export type PlaylistScopeSentinelFields = Pick<PlaylistScopeLogFields, 'requestedCount' | 'sentinel' | 'ytDlpFlag' | 'ytDlpValue'>;

function unreachablePlaylistScopeItem(item: never): never {
  throw new Error(`Unsupported playlist scope item: ${JSON.stringify(item)}`);
}

export function playlistScopeSentinelFields(scope: PlaylistScope | undefined, appLimit: number): PlaylistScopeSentinelFields {
  const items = scope?.items;
  if (!items) {
    return {
      requestedCount: appLimit,
      sentinel: true,
      ytDlpFlag: '--playlist-end',
      ytDlpValue: String(appLimit + 1)
    };
  }

  switch (items.kind) {
    case 'app-limit':
      return {
        requestedCount: appLimit,
        sentinel: true,
        ytDlpFlag: '--playlist-end',
        ytDlpValue: String(appLimit + 1)
      };
    case 'first':
      return {
        requestedCount: items.count,
        sentinel: true,
        ytDlpFlag: '--playlist-items',
        ytDlpValue: `1:${items.count + 1}`
      };
    case 'range':
      return {
        requestedCount: items.to - items.from + 1,
        sentinel: true,
        ytDlpFlag: '--playlist-items',
        ytDlpValue: `${items.from}:${items.to + 1}`
      };
    default:
      return unreachablePlaylistScopeItem(items);
  }
}

export function describePlaylistScopeForLog(scope: PlaylistScope | undefined, appLimit: number): PlaylistScopeLogFields {
  const items = scope?.items;
  const sentinelFields = playlistScopeSentinelFields(scope, appLimit);
  if (!items) {
    return {
      kind: 'app-limit',
      appLimit,
      ...sentinelFields
    };
  }

  switch (items.kind) {
    case 'app-limit':
      return { kind: 'app-limit', appLimit, ...sentinelFields };
    case 'first':
      return { kind: 'first', ...sentinelFields };
    case 'range':
      return { kind: 'range', from: items.from, to: items.to, ...sentinelFields };
    default:
      return unreachablePlaylistScopeItem(items);
  }
}
