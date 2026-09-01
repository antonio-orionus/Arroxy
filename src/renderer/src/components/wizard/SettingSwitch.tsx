import type {ReactNode} from 'react'
import {Field, FieldContent, FieldDescription, FieldTitle} from '../ui/field.js'
import {Switch} from '../ui/switch.js'

// Labeled switch row shared by the settings panels. Lives in its own module —
// both DownloadProfilesSettingsTab and HotkeySettingsSection use it, and a
// shared import keeps that pair acyclic.
export function SettingSwitch({id, label, description, checked, onCheckedChange, testId}: {id: string; label: string; description: string; checked: boolean; onCheckedChange: (checked: boolean) => void; testId?: string}): ReactNode {
	return (
		<Field orientation="horizontal" className="items-center justify-between gap-3">
			<FieldContent className="gap-0.5">
				<FieldTitle id={id} className="text-[13px] font-medium text-foreground">
					{label}
				</FieldTitle>
				<FieldDescription className="text-[11px] text-[var(--text-subtle)]">{description}</FieldDescription>
			</FieldContent>
			<Switch checked={checked} onCheckedChange={onCheckedChange} aria-labelledby={id} data-testid={testId} />
		</Field>
	)
}
