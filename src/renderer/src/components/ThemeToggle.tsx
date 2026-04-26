import type React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useAppStore } from '../store/useAppStore';

type Theme = 'light' | 'dark' | 'system';

export function ThemeToggle(): React.JSX.Element {
  const { uiTheme, setUiTheme } = useAppStore();
  return (
    <ToggleGroup
      value={[uiTheme]}
      onValueChange={(arr) => { if (arr[0]) setUiTheme(arr[0] as Theme); }}
      size="sm"
    >
      <ToggleGroupItem value="light" aria-label="Light mode">
        <Sun className="size-3" />
      </ToggleGroupItem>
      <ToggleGroupItem value="system" aria-label="System default">
        <Monitor className="size-3" />
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label="Dark mode">
        <Moon className="size-3" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
