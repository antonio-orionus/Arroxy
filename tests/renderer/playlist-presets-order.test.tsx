// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { StepPlaylistPresets } from '@renderer/components/wizard/StepPlaylistPresets.js';
import { useAppStore } from '@renderer/store/useAppStore.js';

beforeEach(() => {
  useAppStore.setState({
    playlistSelection: { kind: 'video', tier: 'best', codec: 'best' },
    selectedPlaylistItemIds: ['p1'],
    wizardMode: 'playlist',
    wizardStep: 'playlistPresets'
  } as never);
});

describe('StepPlaylistPresets', () => {
  it('uses brand styling for the active video/audio tab', () => {
    render(<StepPlaylistPresets />);

    expect(screen.getByRole('button', { name: 'Video' })).toHaveClass('aria-pressed:border-[var(--brand)]', 'aria-pressed:bg-[var(--brand-dim)]', 'aria-pressed:text-[var(--brand)]');
    expect(screen.getByRole('button', { name: 'Audio' })).toHaveClass('aria-pressed:border-[var(--brand)]', 'aria-pressed:bg-[var(--brand-dim)]', 'aria-pressed:text-[var(--brand)]');
  });

  it('renders video quality tiers from highest to lowest', () => {
    render(<StepPlaylistPresets />);

    const qualityList = screen.getAllByRole('list').find((list) => within(list).queryByText('Up to 360p') !== null);

    expect(qualityList).toBeDefined();
    expect(
      within(qualityList!)
        .getAllByRole('button')
        .map((button) => button.textContent)
    ).toEqual(['Best qualityHighest available video + audio per item', 'Up to 4KCapped at 2160p, falls back to lower per item', 'Up to 1440pCapped at 2K, falls back to lower per item', 'Up to 1080pCapped at 1080p, falls back to lower per item', 'Up to 720pSmaller files, broad compatibility', 'Up to 480pLow bandwidth', 'Up to 360pSmallest video']);
  });
});
