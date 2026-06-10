import type {BackdropScene} from '../types.js'
import {createDarkAuroraFallbackRenderer} from './fallback.js'
import {FRAG} from './shader.js'

export const darkAuroraScene: BackdropScene = {bodyClassName: 'backdrop-dark-aurora', fallbackRenderScale: 0.75, fragmentShader: FRAG, frameIntervalMs: 1000 / 30, id: 'dark-aurora', maxDevicePixelRatio: 1.5, renderScale: 0.7, createStaticFallbackRenderer: createDarkAuroraFallbackRenderer}
