import { vi } from 'vitest';

const noop = vi.fn();

function makeScope() {
  return { info: noop, warn: noop, error: noop, debug: noop, verbose: noop, silly: noop };
}

const log = {
  ...makeScope(),
  initialize: noop,
  scope: vi.fn().mockImplementation(() => makeScope()),
  transports: {
    file: {
      resolvePathFn: undefined as (() => string) | undefined,
      getFile: vi.fn().mockReturnValue({ path: '/tmp/logs/main.log' })
    }
  }
};

export default log;
