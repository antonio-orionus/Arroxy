import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UpdateBanner } from '@renderer/components/UpdateBanner';
import type { UpdateAvailablePayload } from '@shared/types';

function makeInfo(overrides: Partial<UpdateAvailablePayload> = {}): UpdateAvailablePayload {
  return { version: '1.2.0', currentVersion: '0.0.1', canAutoInstall: true, ...overrides };
}

describe('UpdateBanner', () => {
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

  it('shows Install & Restart button when canAutoInstall is true', () => {
    render(
      <UpdateBanner
        info={makeInfo({ canAutoInstall: true })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Install & Restart' })).toBeInTheDocument();
    expect(screen.queryByText('Download ↗')).not.toBeInTheDocument();
  });

  it('shows Download ↗ link when canAutoInstall is false', () => {
    render(
      <UpdateBanner
        info={makeInfo({ canAutoInstall: false })}
        installing={false}
        onInstall={vi.fn()}
        onDownload={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(screen.getByText('Download ↗')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Install & Restart' })).not.toBeInTheDocument();
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
    const onDownload = vi.fn();
    render(
      <UpdateBanner
        info={makeInfo({ canAutoInstall: false })}
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
