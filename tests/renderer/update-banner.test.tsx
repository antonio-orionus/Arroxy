import { render, screen, fireEvent, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateBanner } from '@renderer/components/UpdateBanner';
import { resolveAction } from '@renderer/components/updateBannerAction';
import type { UpdateAvailablePayload } from '@shared/types';

function makeInfo(overrides: Partial<UpdateAvailablePayload> = {}): UpdateAvailablePayload {
  return { version: '1.2.0', currentVersion: '0.0.1', installChannel: 'direct', ...overrides };
}

describe('resolveAction', () => {
  it('scoop → command regardless of platform', () => {
    expect(resolveAction('scoop', 'win32')).toEqual({ kind: 'command', cmd: 'scoop update arroxy' });
    expect(resolveAction('scoop', 'darwin')).toEqual({ kind: 'command', cmd: 'scoop update arroxy' });
  });

  it('homebrew → command regardless of platform', () => {
    expect(resolveAction('homebrew', 'darwin')).toEqual({ kind: 'command', cmd: 'brew upgrade --cask arroxy' });
    expect(resolveAction('homebrew', 'linux')).toEqual({ kind: 'command', cmd: 'brew upgrade --cask arroxy' });
  });

  it('winget → install regardless of platform', () => {
    expect(resolveAction('winget', 'win32')).toEqual({ kind: 'install' });
    expect(resolveAction('winget', 'darwin')).toEqual({ kind: 'install' });
  });

  it('direct → install on linux/win32, download on darwin', () => {
    expect(resolveAction('direct', 'linux')).toEqual({ kind: 'install' });
    expect(resolveAction('direct', 'win32')).toEqual({ kind: 'install' });
    expect(resolveAction('direct', 'darwin')).toEqual({ kind: 'download' });
  });

  it('flatpak → command pointing at the Flathub app id', () => {
    expect(resolveAction('flatpak', 'linux')).toEqual({
      kind: 'command',
      cmd: 'flatpak update io.github.antonio_orionus.Arroxy',
    });
  });
});

describe('UpdateBanner', () => {
  beforeEach(() => {
    window.platform = 'linux';
    Object.defineProperty(navigator, 'clipboard', {
      writable: true, configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders both version numbers', () => {
    render(
      <UpdateBanner
        info={makeInfo()}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('Arroxy 1.2.0')).toBeInTheDocument();
    expect(screen.getByText(/you have 0\.0\.1/)).toBeInTheDocument();
  });

  it('shows Install & Restart for direct channel on linux', () => {
    window.platform = 'linux';
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'direct' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Install & Restart' })).toBeInTheDocument();
    expect(screen.queryByText('Download ↗')).not.toBeInTheDocument();
  });

  it('shows Download ↗ for direct channel on darwin', () => {
    window.platform = 'darwin';
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'direct' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('Download ↗')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install & Restart' })).not.toBeInTheDocument();
  });

  it('shows Install & Restart for winget channel regardless of platform', () => {
    window.platform = 'darwin';
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'winget' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Install & Restart' })).toBeInTheDocument();
  });

  it('renders scoop command + copy button; clipboard receives the command', async () => {
    window.platform = 'win32';
    const onDismiss = vi.fn();
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'scoop' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByTestId('update-command')).toHaveTextContent('scoop update arroxy');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy command/i }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('scoop update arroxy');
    expect(screen.getByTestId('update-banner')).toBeInTheDocument();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('renders homebrew command + copy button; clipboard receives the command', async () => {
    window.platform = 'darwin';
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'homebrew' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByTestId('update-command')).toHaveTextContent('brew upgrade --cask arroxy');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy command/i }));
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('brew upgrade --cask arroxy');
  });

  it('copy button swaps icon to CopyCheck for ~2 s, then reverts', async () => {
    vi.useFakeTimers();
    window.platform = 'darwin';
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'homebrew' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Copy command/i })).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy command/i }));
    });

    expect(screen.getByRole('button', { name: /Copied command/i })).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByRole('button', { name: /Copy command/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copied command/i })).not.toBeInTheDocument();
  });

  it('disables Install & Restart and shows Downloading… while installing', () => {
    render(
      <UpdateBanner
        info={makeInfo()}
        installing={true}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    const btn = screen.getByRole('button', { name: /Downloading/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent('Downloading…');
  });

  it('calls onInstall when Install & Restart is clicked', () => {
    const onInstall = vi.fn();
    render(
      <UpdateBanner
        info={makeInfo()}
        installing={false}
        onInstall={onInstall}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Install & Restart' }));
    expect(onInstall).toHaveBeenCalledOnce();
  });

  it('calls onDownload when Download ↗ is clicked', () => {
    window.platform = 'darwin';
    const onDownload = vi.fn();
    render(
      <UpdateBanner
        info={makeInfo({ installChannel: 'direct' })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={onDownload}
        onDismiss={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText('Download ↗'));
    expect(onDownload).toHaveBeenCalledOnce();
  });

  it('calls onDismiss when × is clicked', () => {
    const onDismiss = vi.fn();
    render(
      <UpdateBanner
        info={makeInfo()}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={onDismiss}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss update banner' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has the correct test id for integration targeting', () => {
    render(
      <UpdateBanner
        info={makeInfo()}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByTestId('update-banner')).toBeInTheDocument();
  });
});
