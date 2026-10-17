import {contextBridge, ipcRenderer} from 'electron'
import {parseInstallChannelArg} from '@shared/runtimeInfo.js'
import type {RuntimeInfo} from '@shared/runtimeInfo.js'
import {createPreloadApi} from './createPreloadApi.js'

declare const __APP_VERSION__: string

const runtimeInfo: RuntimeInfo = {arch: process.arch, osVersion: process.getSystemVersion(), installChannel: parseInstallChannelArg(process.argv)}

contextBridge.exposeInMainWorld('appApi', createPreloadApi(ipcRenderer))
contextBridge.exposeInMainWorld('platform', process.platform)
contextBridge.exposeInMainWorld('appVersion', __APP_VERSION__)
contextBridge.exposeInMainWorld('runtimeInfo', runtimeInfo)
