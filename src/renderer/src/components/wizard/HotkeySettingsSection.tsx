import {useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode} from 'react'
import {useTranslation} from 'react-i18next'
import {RotateCcw} from 'lucide-react'
import {hotkeyAcceleratorSchema} from '@shared/schemas.js'
import {DEFAULTS} from '@shared/constants.js'
import {useAppStore} from '../../store/useAppStore.js'
import {formatHotkeyChord} from '../../lib/hotkeyLabel.js'
import {Button} from '../ui/button.js'
import {Field, FieldContent, FieldDescription, FieldGroup, FieldTitle} from '../ui/field.js'
import {SettingSwitch} from './SettingSwitch.js'

const STOP_KEYS = new Set(['Escape', 'Tab'])

// Key recorder for the global hotkey chord. Captures a keydown combo, maps it
// to an Electron accelerator, validates it against the shared schema, and
// saves. Escape cancels; Tab is never captured (focus nav). Invalid combos are
// ignored — recording continues until a valid chord or Escape. A chord another
// app already owns still saves (the setting is valid); the conflict surfaces
// from main's registration state below the recorder.
export function HotkeySettingsSection(): ReactNode {
	const {t} = useTranslation()
	const setHotkeyEnabled = useAppStore(state => state.setHotkeyEnabled)
	const setHotkeyAccelerator = useAppStore(state => state.setHotkeyAccelerator)
	const enabled = useAppStore(state => state.settings?.common?.hotkeyEnabled ?? false)
	const accelerator = useAppStore(state => state.settings?.common?.hotkeyAccelerator ?? DEFAULTS.hotkeyAccelerator)
	const hotkeyRegistration = useAppStore(state => state.hotkeyRegistration)

	const [recording, setRecording] = useState(false)
	const restoreFocusPending = useRef(false)
	const recordingButtonRef = useRef<HTMLButtonElement>(null)
	const changeButtonRef = useRef<HTMLButtonElement>(null)

	// Move focus into the recorder button once it mounts (jsx-a11y bans the
	// autoFocus attribute; focusing from an effect is the sanctioned path).
	useEffect(() => {
		if (recording) recordingButtonRef.current?.focus()
	}, [recording])

	useEffect(() => {
		if (!recording && restoreFocusPending.current) {
			changeButtonRef.current?.focus()
			restoreFocusPending.current = false
		}
	}, [recording])

	const stopRecording = useCallback((restoreFocus: boolean) => {
		if (restoreFocus) restoreFocusPending.current = true
		setRecording(false)
	}, [])

	const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
		if (STOP_KEYS.has(event.key)) {
			// Escape returns to the control that opened the recorder. Tab keeps its
			// native focus-navigation behavior instead of trapping focus here.
			stopRecording(event.key === 'Escape')
			return
		}
		event.preventDefault()
		event.stopPropagation()
		const chord = buildAccelerator(event)
		if (!chord) return
		const parsed = hotkeyAcceleratorSchema.safeParse(chord)
		if (!parsed.success) return
		void (async () => {
			await setHotkeyAccelerator(parsed.data)
			stopRecording(true)
		})()
	}

	return (
		<FieldGroup className="gap-4">
			<SettingSwitch id="profiles-settings-hotkey" label={t('wizard.url.hotkey.toggle')} description={t('wizard.url.hotkey.toggleDescription')} checked={enabled} onCheckedChange={checked => void setHotkeyEnabled(checked)} testId="profiles-settings-hotkey-toggle" />

			<Field className="gap-1.5">
				<FieldContent className="gap-0.5">
					<FieldTitle id="profiles-settings-hotkey-chord" className="text-[13px] font-medium text-foreground">
						{t('wizard.url.hotkey.changeShortcut')}
					</FieldTitle>
					<FieldDescription className="text-[11px] text-[var(--text-subtle)]" data-testid="profiles-settings-hotkey-chord-value">
						{formatHotkeyChord(accelerator).join(' + ')}
					</FieldDescription>
				</FieldContent>
				<div className="flex items-center gap-2" data-testid="profiles-settings-hotkey-recorder">
					{recording ? (
						<Button type="button" variant="outline" size="sm" ref={recordingButtonRef} onKeyDown={handleKeyDown} onBlur={() => stopRecording(false)} data-testid="profiles-settings-hotkey-recording">
							{t('wizard.url.hotkey.recording')}
						</Button>
					) : (
						<Button
							type="button"
							variant="outline"
							size="sm"
							ref={changeButtonRef}
							onClick={() => {
								setRecording(true)
							}}
							data-testid="profiles-settings-hotkey-change"
						>
							{t('wizard.url.hotkey.changeShortcut')}
						</Button>
					)}
					<Button type="button" variant="ghost" size="sm" disabled={accelerator === DEFAULTS.hotkeyAccelerator} onClick={() => void setHotkeyAccelerator(DEFAULTS.hotkeyAccelerator)} data-testid="profiles-settings-hotkey-reset">
						<RotateCcw data-icon="inline-start" aria-hidden />
						{t('wizard.url.hotkey.reset')}
					</Button>
					<Button type="button" variant="ghost" size="sm" disabled={hotkeyRegistration !== 'registered'} onClick={() => void window.appApi.hotkey.testPress()} data-testid="profiles-settings-hotkey-test">
						{t('wizard.url.hotkey.test')}
					</Button>
				</div>
				{hotkeyRegistration === 'conflict' ? (
					<FieldDescription className="text-[11px] text-destructive" data-testid="profiles-settings-hotkey-conflict">
						{t('wizard.url.hotkey.conflict')}
					</FieldDescription>
				) : null}
			</Field>
		</FieldGroup>
	)
}

// KeyboardEvent → Electron accelerator string (canonical modifier order).
// Returns null when the pressed key alone cannot form a chord — no modifier
// held, or a key Electron accelerators cannot address.
function buildAccelerator(event: ReactKeyboardEvent<HTMLButtonElement>): string | null {
	const modifiers: string[] = []
	if (event.ctrlKey) modifiers.push('Ctrl')
	if (event.altKey) modifiers.push('Alt')
	if (event.metaKey) modifiers.push('Super')
	if (event.shiftKey) modifiers.push('Shift')
	if (modifiers.length === 0) return null
	const key = normalizeKey(event.key)
	if (!key) return null
	return [...modifiers, key].join('+')
}

function normalizeKey(eventKey: string): string | null {
	if (/^[a-zA-Z0-9]$/.test(eventKey)) return eventKey.toUpperCase()
	const named: Record<string, string> = {
		F1: 'F1',
		F2: 'F2',
		F3: 'F3',
		F4: 'F4',
		F5: 'F5',
		F6: 'F6',
		F7: 'F7',
		F8: 'F8',
		F9: 'F9',
		F10: 'F10',
		F11: 'F11',
		F12: 'F12',
		F13: 'F13',
		F14: 'F14',
		F15: 'F15',
		F16: 'F16',
		F17: 'F17',
		F18: 'F18',
		F19: 'F19',
		' ': 'Space',
		Tab: 'Tab',
		CapsLock: 'Capslock',
		NumLock: 'Numlock',
		ScrollLock: 'Scrolllock',
		'`': 'Backquote'
	}
	return named[eventKey] ?? null
}
