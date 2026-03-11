import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi'

// 动作类型定义
export type Action = (UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent) & {
    timestamp: number // 相对于录制开始的时间戳
}

// Custom APIs for renderer
const api = {
    // 录制控制
    startRecording: () => ipcRenderer.invoke('start-recording'),
    stopRecording: () => ipcRenderer.invoke('stop-recording'),
    getRecordingState: () => ipcRenderer.invoke('get-recording-state'),

    // 重放控制
    replay: (actions: Action[], speedMultiplier?: number) =>
        ipcRenderer.invoke('replay', actions, speedMultiplier),
    stopReplay: () => ipcRenderer.invoke('stop-replay'),

    // 事件监听
    onRecordingProgress: (callback: (data: { count: number; duration: number }) => void) => {
        ipcRenderer.on('recording-progress', (_, data) => callback(data))
    },
    removeRecordingProgressListener: () => {
        ipcRenderer.removeAllListeners('recording-progress')
    }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
