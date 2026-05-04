import { useEffect, useState } from 'react';
import type { UpdateAvailablePayload } from '@shared/types';

export interface UpdateChannelState {
  info: UpdateAvailablePayload | null;
  installing: boolean;
  error: string | null;
  install: () => void;
  download: () => void;
  dismiss: () => void;
}

export function useUpdateChannel(): UpdateChannelState {
  const [info, setInfo] = useState<UpdateAvailablePayload | null>(null);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return window.appApi.updater.onUpdateAvailable(setInfo);
  }, []);

  function install(): void {
    setInstalling(true);
    setError(null);
    void window.appApi.updater.install().then((result) => {
      setInstalling(false);
      if (!result.ok) setError(result.error);
    });
  }

  function download(): void {
    void window.appApi.shell.openExternal('https://github.com/antonio-orionus/Arroxy/releases/latest');
    setInfo(null);
  }

  function dismiss(): void {
    setInfo(null);
    setError(null);
  }

  return { info, installing, error, install, download, dismiss };
}
