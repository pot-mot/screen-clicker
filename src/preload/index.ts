import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Action } from '../main/Action'
import IpcRendererEvent = Electron.IpcRendererEvent

type ActionCallback = (event: IpcRendererEvent, action: { action: Action }) => void

class ActionListenerManager {
    private listeners: Map<number, ActionCallback> = new Map()
    private nextId: number = 0

    addListener(callback: ActionCallback): number {
        const id = this.nextId++
        const wrappedCallback: ActionCallback = (event, data) => {
            callback(event, data)
        }
        this.listeners.set(id, wrappedCallback)
        ipcRenderer.on('action', wrappedCallback)
        return id
    }

    removeListener(id: number): void {
        const callback = this.listeners.get(id)
        if (callback) {
            ipcRenderer.off('action', callback)
            this.listeners.delete(id)
        }
    }

    clear(): void {
        this.listeners.forEach((callback) => {
            ipcRenderer.off('action', callback)
        })
        this.listeners.clear()
    }
}

const actionListenerManager = new ActionListenerManager()

// Custom APIs for renderer
const api = {
    // 录制控制
    startRecording: () => ipcRenderer.invoke('startRecording'),
    stopRecording: () => ipcRenderer.invoke('stopRecording'),
    isRecording: () => ipcRenderer.invoke('isRecording'),

    // 重放控制
    startReplay: (actions: Action[], speedMultiplier?: number) =>
        ipcRenderer.invoke('startReplay', actions, speedMultiplier),
    stopReplay: () => ipcRenderer.invoke('stopReplay'),
    isReplaying: () => ipcRenderer.invoke('isReplaying'),

    // 事件监听
    onAction: (callback: ActionCallback): number => {
        return actionListenerManager.addListener(callback)
    },
    offAction: (id: number): void => {
        actionListenerManager.removeListener(id)
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
