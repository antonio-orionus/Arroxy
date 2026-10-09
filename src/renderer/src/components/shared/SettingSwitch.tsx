import type {ReactNode} from 'react'
import {Switch} from '../ui/switch.js'
import {SettingRow, type SettingRowProps} from './SettingRow.js'

// A boolean setting. `testId` lands on the switch itself, where workflow tests click.
export function SettingSwitch({checked, onCheckedChange, disabled, testId, ...row}: Omit<SettingRowProps, 'testId'> & {checked: boolean; onCheckedChange: (checked: boolean) => void; disabled?: boolean; testId?: string}): ReactNode {
	return (
		<SettingRow {...row}>
			<Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} aria-labelledby={row.id} data-testid={testId} />
		</SettingRow>
	)
}
