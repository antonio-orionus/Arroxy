import type {BackdropScene} from '../types.js'
import {FRAG} from './shader.js'

export const lightOceanScene: BackdropScene = {fragmentShader: FRAG, frameIntervalMs: 1000 / 30, id: 'light-ocean', maxDevicePixelRatio: 1.5, renderScale: 0.75}
