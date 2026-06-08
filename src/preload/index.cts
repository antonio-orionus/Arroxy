import {contextBridge, ipcRenderer} from 'electron'
import {createPreloadApi} from './createPreloadApi.js'

declare const __APP_VERSION__: string

contextBridge.exposeInMainWorld('appApi', createPreloadApi(ipcRenderer))
contextBridge.exposeInMainWorld('platform', process.platform)
contextBridge.exposeInMainWorld('appVersion', __APP_VERSION__)
