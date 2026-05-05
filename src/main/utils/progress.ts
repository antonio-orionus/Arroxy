export function parsePercentFromLine(line: string): number | undefined {
  // eslint-disable-next-line security/detect-unsafe-regex -- bounded: \d+ is constrained by the line length from yt-dlp output
  const match = /(\d+(?:\.\d+)?)%/.exec(line);
  if (!match) return undefined;

  const parsed = Number.parseFloat(match[1]);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
}
