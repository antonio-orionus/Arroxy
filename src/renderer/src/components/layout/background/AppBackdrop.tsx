import {type ReactNode} from 'react'
import {CanvasSceneHost} from './CanvasSceneHost.js'
import type {BackdropColorScheme, BackdropScene} from './types.js'

// The animated sky behind a style that has one. `scenes` is null when the
// painted style has no backdrop or hardware WebGL is not available.
export function AppBackdrop({scenes, colorScheme, softwareWebglAllowed = false, onUnavailable}: {scenes: Readonly<Record<BackdropColorScheme, BackdropScene>> | null; colorScheme: BackdropColorScheme; softwareWebglAllowed?: boolean; onUnavailable: (reason: string) => void}): ReactNode {
	if (!scenes) return null
	const scene = scenes[colorScheme]
	return <CanvasSceneHost key={`${scene.id}-${softwareWebglAllowed ? 'software' : 'hardware'}`} scene={scene} softwareWebglAllowed={softwareWebglAllowed} onUnavailable={onUnavailable} />
}
