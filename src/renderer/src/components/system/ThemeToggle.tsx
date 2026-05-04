import type React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { useAppStore } from '../../store/useAppStore';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle(): React.JSX.Element {
  const { t } = useTranslation();
  const { uiTheme, setUiTheme } = useAppStore();
  return (
    <ToggleGroup
      value={[uiTheme]}
      onValueChange={(arr) => {
        if (arr[0]) setUiTheme(arr[0] as Theme);
      }}
      size="sm"
    >
      <ToggleGroupItem value="light" aria-label={t('theme.light')}>
        <Sun className="size-3" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label={t('theme.system')}>
        <Monitor className="size-3" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label={t('theme.dark')}>
        <Moon className="size-3" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
