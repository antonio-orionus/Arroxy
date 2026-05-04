import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import { initI18n } from '@shared/i18n';

initI18n('en');

// jsdom doesn't implement matchMedia — stub it globally for all tests that need it
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}
