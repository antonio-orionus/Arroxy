import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('electron', () => ({
  clipboard: { readText: vi.fn() }
}));

vi.mock('@shared/ipc', () => ({
  IPC_CHANNELS: { eventsClipboardUrl: 'events:clipboardUrl' }
}));

import { ClipboardWatcher, type WatcherWindow, type WatcherEvent } from '@main/services/ClipboardWatcher';

type SendMock = WatcherWindow['send'] & { mock: { calls: unknown[][] } };

interface FakeWindow extends WatcherWindow {
  fire(event: WatcherEvent): void;
  setFocused(value: boolean): void;
  setVisible(value: boolean): void;
  send: SendMock;
}

function makeWindow(opts: { focused?: boolean; visible?: boolean; destroyed?: boolean } = {}): FakeWindow {
  let focused = opts.focused ?? true;
  let visible = opts.visible ?? true;
  const destroyed = opts.destroyed ?? false;
  const listeners = new Map<WatcherEvent, Set<() => void>>();
  const send = vi.fn() as unknown as SendMock;
  return {
    isFocused: () => focused,
    isVisible: () => visible,
    isDestroyed: () => destroyed,
    on: (event, cb) => {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event)!.add(cb);
    },
    off: (event, cb) => {
      listeners.get(event)?.delete(cb);
    },
    send,
    fire: (event) => {
      listeners.get(event)?.forEach((cb) => cb());
    },
    setFocused: (value) => {
      focused = value;
    },
    setVisible: (value) => {
      visible = value;
    }
  };
}

const yt = (id: string): string => `https://www.youtube.com/watch?v=${id}`;

describe('ClipboardWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not poll when disabled by default', () => {
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    new ClipboardWatcher(win, 800, reader);
    reader.readText.mockReturnValue(yt('abc'));
    vi.advanceTimersByTime(5000);
    expect(win.send).not.toHaveBeenCalled();
  });

  it('sends nothing when clipboard has non-YouTube text', () => {
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    reader.readText.mockReturnValue('https://example.com');
    vi.advanceTimersByTime(800);
    expect(win.send).not.toHaveBeenCalled();
  });

  it('sends the channel with a YouTube URL on detection', () => {
    const url = yt('abc');
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    reader.readText.mockReturnValue(url);
    vi.advanceTimersByTime(800);
    expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', url);
  });

  it('deduplicates — same URL on consecutive ticks sends only once', () => {
    const url = yt('abc');
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    reader.readText.mockReturnValue(url);
    vi.advanceTimersByTime(2400);
    expect(win.send).toHaveBeenCalledTimes(1);
  });

  it('sends again when clipboard changes to a new YouTube URL', () => {
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);

    reader.readText.mockReturnValue(yt('first'));
    vi.advanceTimersByTime(800);

    reader.readText.mockReturnValue(yt('second'));
    vi.advanceTimersByTime(800);

    expect(win.send).toHaveBeenCalledTimes(2);
    expect(win.send).toHaveBeenLastCalledWith('events:clipboardUrl', yt('second'));
  });

  it('fires for a URL already on clipboard at enable time', () => {
    // Cold-start scenario: user copies a URL in the browser, then opens (or
    // focuses) Arroxy. The URL was on the clipboard before enable; we still
    // want to surface it.
    const url = yt('preexisting');
    const reader = { readText: vi.fn().mockReturnValue(url) };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    vi.advanceTimersByTime(800);
    expect(win.send).toHaveBeenCalledExactlyOnceWith('events:clipboardUrl', url);
  });

  it('stops polling after setEnabled(false)', () => {
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    reader.readText.mockReturnValue(yt('abc'));
    vi.advanceTimersByTime(800);
    watcher.setEnabled(false);
    vi.advanceTimersByTime(2400);
    expect(win.send).toHaveBeenCalledTimes(1);
  });

  it('accepts youtu.be short URLs', () => {
    const url = 'https://youtu.be/abc123';
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    reader.readText.mockReturnValue(url);
    vi.advanceTimersByTime(800);
    expect(win.send).toHaveBeenCalledWith('events:clipboardUrl', url);
  });

  it('trims whitespace before sending', () => {
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    reader.readText.mockReturnValue(`  ${yt('abc')}  `);
    vi.advanceTimersByTime(800);
    expect(win.send).toHaveBeenCalledWith('events:clipboardUrl', yt('abc'));
  });

  it('dispose clears the interval idempotently', () => {
    const reader = { readText: vi.fn().mockReturnValue('') };
    const win = makeWindow();
    const watcher = new ClipboardWatcher(win, 800, reader);
    watcher.setEnabled(true);
    watcher.dispose();
    watcher.dispose();
    reader.readText.mockReturnValue(yt('abc'));
    vi.advanceTimersByTime(2400);
    expect(win.send).not.toHaveBeenCalled();
  });

  describe('focus / visibility gating', () => {
    it('does not start polling when window is not focused at enable time', () => {
      const reader = { readText: vi.fn().mockReturnValue('') };
      const win = makeWindow({ focused: false });
      const watcher = new ClipboardWatcher(win, 800, reader);
      watcher.setEnabled(true);
      reader.readText.mockReturnValue(yt('abc'));
      vi.advanceTimersByTime(2400);
      expect(win.send).not.toHaveBeenCalled();
    });

    it('does not start polling when window is hidden at enable time', () => {
      const reader = { readText: vi.fn().mockReturnValue('') };
      const win = makeWindow({ visible: false });
      const watcher = new ClipboardWatcher(win, 800, reader);
      watcher.setEnabled(true);
      reader.readText.mockReturnValue(yt('abc'));
      vi.advanceTimersByTime(2400);
      expect(win.send).not.toHaveBeenCalled();
    });

    it('pauses polling on blur and resumes on focus', () => {
      const reader = { readText: vi.fn().mockReturnValue('') };
      const win = makeWindow({ focused: true });
      const watcher = new ClipboardWatcher(win, 800, reader);
      watcher.setEnabled(true);

      reader.readText.mockReturnValue(yt('first'));
      vi.advanceTimersByTime(800);
      expect(win.send).toHaveBeenCalledTimes(1);

      win.setFocused(false);
      win.fire('blur');

      reader.readText.mockReturnValue(yt('blurred'));
      vi.advanceTimersByTime(2400);
      expect(win.send).toHaveBeenCalledTimes(1);

      win.setFocused(true);
      win.fire('focus');
      vi.advanceTimersByTime(800);
      expect(win.send).toHaveBeenCalledTimes(2);
      expect(win.send).toHaveBeenLastCalledWith('events:clipboardUrl', yt('blurred'));
    });

    it('pauses polling on hide and resumes on show', () => {
      const reader = { readText: vi.fn().mockReturnValue('') };
      const win = makeWindow();
      const watcher = new ClipboardWatcher(win, 800, reader);
      watcher.setEnabled(true);

      win.setVisible(false);
      win.fire('hide');
      reader.readText.mockReturnValue(yt('hidden'));
      vi.advanceTimersByTime(2400);
      expect(win.send).not.toHaveBeenCalled();

      win.setVisible(true);
      win.fire('show');
      vi.advanceTimersByTime(800);
      expect(win.send).toHaveBeenCalledTimes(1);
    });

    it('pauses polling on minimize and resumes on restore', () => {
      const reader = { readText: vi.fn().mockReturnValue('') };
      const win = makeWindow();
      const watcher = new ClipboardWatcher(win, 800, reader);
      watcher.setEnabled(true);

      win.setVisible(false);
      win.fire('minimize');
      reader.readText.mockReturnValue(yt('mini'));
      vi.advanceTimersByTime(2400);
      expect(win.send).not.toHaveBeenCalled();

      win.setVisible(true);
      win.fire('restore');
      vi.advanceTimersByTime(800);
      expect(win.send).toHaveBeenCalledTimes(1);
    });

    it('dispose detaches focus/visibility listeners', () => {
      const reader = { readText: vi.fn().mockReturnValue('') };
      const win = makeWindow();
      const offSpy = vi.spyOn(win, 'off');
      const watcher = new ClipboardWatcher(win, 800, reader);
      watcher.setEnabled(true);
      watcher.dispose();
      // Every event we subscribed to must be detached on dispose.
      const events = new Set(offSpy.mock.calls.map((c) => c[0]));
      expect(events).toEqual(new Set(['focus', 'blur', 'show', 'hide', 'minimize', 'restore']));
    });
  });
});
