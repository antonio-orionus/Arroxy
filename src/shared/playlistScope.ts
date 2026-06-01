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

export function describePlaylistScopeForLog(scope: PlaylistScope | undefined, appLimit: number): PlaylistScopeLogFields {
  const items = scope?.items;
  if (!items || items.kind === 'app-limit') {
    return {
      kind: 'app-limit',
      appLimit,
      requestedCount: appLimit,
      sentinel: true,
      ytDlpFlag: '--playlist-end',
      ytDlpValue: String(appLimit + 1)
    };
  }

  if (items.kind === 'first') {
    return {
      kind: 'first',
      requestedCount: items.count,
      sentinel: true,
      ytDlpFlag: '--playlist-items',
      ytDlpValue: `1:${items.count + 1}`
    };
  }

  return {
    kind: 'range',
    from: items.from,
    to: items.to,
    requestedCount: items.to - items.from + 1,
    sentinel: true,
    ytDlpFlag: '--playlist-items',
    ytDlpValue: `${items.from}:${items.to + 1}`
  };
}
