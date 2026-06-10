import {type ReactNode} from 'react'
import {darkAuroraScene} from './darkAurora/scene.js'
import {lightOceanScene} from './lightOcean/scene.js'
import {CanvasSceneHost} from './CanvasSceneHost.js'
import type {BackdropColorScheme} from './types.js'

export function AppBackdrop({colorScheme}: {colorScheme: BackdropColorScheme}): ReactNode {
	const scene = colorScheme === 'dark' ? darkAuroraScene : lightOceanScene
	return <CanvasSceneHost key={scene.id} scene={scene} />
}
