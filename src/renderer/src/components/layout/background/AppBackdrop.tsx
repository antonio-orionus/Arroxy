import {type ReactNode} from 'react'
import type {BackdropRenderMode} from '@shared/types.js'
import {darkAuroraScene} from './darkAurora/scene.js'
import {lightOceanScene} from './lightOcean/scene.js'
import {CanvasSceneHost} from './CanvasSceneHost.js'
import type {BackdropColorScheme} from './types.js'

export function AppBackdrop({colorScheme, renderMode = 'gpu', softwareWebglAllowed = false}: {colorScheme: BackdropColorScheme; renderMode?: BackdropRenderMode; softwareWebglAllowed?: boolean}): ReactNode {
	const scene = colorScheme === 'dark' ? darkAuroraScene : lightOceanScene
	return <CanvasSceneHost key={`${scene.id}-${renderMode}-${softwareWebglAllowed ? 'software' : 'hardware'}`} scene={scene} renderMode={renderMode} softwareWebglAllowed={softwareWebglAllowed} />
}
