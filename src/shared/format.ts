// Returns the input only if it's a non-empty string; otherwise undefined.
// Used in lieu of `||` where we want empty-string-as-falsy semantics
// (which `??` does not provide) without per-call eslint-disables.
export function nonEmpty(s: string | null | undefined): string | undefined {
  return s && s.length > 0 ? s : undefined;
}

export function humanSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  return `${value.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}
