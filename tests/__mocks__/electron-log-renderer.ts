import { vi } from 'vitest';

const noop = vi.fn();

function makeScope() {
  return { info: noop, warn: noop, error: noop, debug: noop, verbose: noop, silly: noop };
}

const log = {
  ...makeScope(),
  scope: vi.fn().mockImplementation(() => makeScope())
};

export default log;
