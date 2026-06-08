export function replaceHash(hash: string): void {
  if (typeof window === 'undefined') return;

  const normalizedHash = hash.startsWith('#') ? hash : `#${hash}`;
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${normalizedHash}`);
  window.dispatchEvent(new Event('hashchange'));
}
