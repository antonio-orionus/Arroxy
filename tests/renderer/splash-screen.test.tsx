// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SplashScreen } from '@renderer/components/system/SplashScreen.js';

describe('SplashScreen', () => {
  it('blocks pointer events while warmup overlay is visible', () => {
    render(<SplashScreen initialized={false} warmupBlocking={[]} warmupDiagnostics={null} warmupProgress={null} />);

    expect(screen.getByTestId('splash-overlay')).toHaveStyle({ pointerEvents: 'auto' });
  });
});
