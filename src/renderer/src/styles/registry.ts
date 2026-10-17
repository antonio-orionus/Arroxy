import type {UiStyle} from '@shared/schemas.js'
import {darkAuroraScene} from '../components/layout/background/darkAurora/scene.js'
import {lightOceanScene} from '../components/layout/background/lightOcean/scene.js'
import type {BackdropColorScheme, BackdropScene} from '../components/layout/background/types.js'

// One entry per style (DESIGN.md §8). Code reads what a style can do from here,
// never by comparing style ids; its paint lives in `styles/<id>.css`.
export interface StyleDefinition {
	labelKey: string
	descriptionKey: string
	// A WebGL scene per color scheme, or null for a style painted by tokens alone.
	backdrop: Record<BackdropColorScheme, BackdropScene> | null
}

export const STYLES = {
	aurora: {labelKey: 'wizard.url.style.aurora.label', descriptionKey: 'wizard.url.style.aurora.description', backdrop: {dark: darkAuroraScene, light: lightOceanScene}},
	minimal: {labelKey: 'wizard.url.style.minimal.label', descriptionKey: 'wizard.url.style.minimal.description', backdrop: null}
} as const satisfies Record<UiStyle, StyleDefinition>

// The base layer every style overrides. It needs no GPU, so it is what renders
// whenever a style's backdrop cannot.
export const BASE_STYLE = 'minimal' satisfies UiStyle

// Whether hardware WebGL can draw a backdrop: not known until the graphics
// policy arrives, then available, or blocked by the policy or a runtime failure.
export type BackdropAvailability = 'unknown' | 'available' | 'blocked'

export function resolveEffectiveStyle(chosen: UiStyle, availability: BackdropAvailability): UiStyle {
	if (STYLES[chosen].backdrop === null) return chosen
	return availability === 'blocked' ? BASE_STYLE : chosen
}
