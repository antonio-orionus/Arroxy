export function playlistTitleFallback(...titles: (string | null | undefined)[]): string {
  for (const title of titles) {
    const trimmed = title?.trim();
    if (trimmed) return trimmed;
  }
  return 'Playlist';
}
