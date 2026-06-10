import type {BackdropScene} from '../types.js'
import {createLightOceanFallbackRenderer} from './fallback.js'
import {FRAG} from './shader.js'

export const lightOceanScene: BackdropScene = {bodyClassName: 'backdrop-light-ocean', fallbackRenderScale: 0.6, fragmentShader: FRAG, frameIntervalMs: 1000 / 24, id: 'light-ocean', maxDevicePixelRatio: 1.25, renderScale: 0.6, createStaticFallbackRenderer: createLightOceanFallbackRenderer}
