import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Action } from '../main/Action'
import IpcRendererEvent = Electron.IpcRendererEvent

type ActionCallback = (event: IpcRendererEvent, action: { action: Action }) => void

class ListenerManager<Callback extends (
    event: IpcRendererEvent, ...args: any[]
) => void> {
    private readonly channel: string
    private listeners: Map<number, Callback> = new Map()
    private nextId: number = 0

    constructor(channel: string) {
        this.channel = channel
    }

    addListener(callback: Callback): number {
        const id = this.nextId++
        this.listeners.set(id, callback)
        ipcRenderer.on(this.channel, callback)
        return id
    }

    removeListener(id: number): void {
        const callback = this.listeners.get(id)
        if (callback) {
            ipcRenderer.off(this.channel, callback)
            this.listeners.delete(id)
        }
    }

    clear(): void {
        this.listeners.forEach((callback) => {
            ipcRenderer.off(this.channel, callback)
        })
        this.listeners.clear()
    }

    getListener(id: number): Callback | undefined {
        return this.listeners.get(id)
    }
}

const actionRecordListenerManager = new ListenerManager<ActionCallback>('actionRecord')

const actionExecuteListenerManager = new ListenerManager<ActionCallback>('actionExecute')

// Custom APIs for renderer
const api = {
    // 录制控制
    startRecording: (reset: boolean) => ipcRenderer.invoke('startRecording', reset),
    stopRecording: () => ipcRenderer.invoke('stopRecording'),
    isRecording: () => ipcRenderer.invoke('isRecording'),

    // 重放控制
    startReplay: (actions: Action[], speedMultiplier?: number) =>
        ipcRenderer.invoke('startReplay', actions, speedMultiplier),
    stopReplay: () => ipcRenderer.invoke('stopReplay'),
    isReplaying: () => ipcRenderer.invoke('isReplaying'),

    // 行为记录监听
    onActionRecord: (callback: ActionCallback): number => {
        return actionRecordListenerManager.addListener(callback)
    },
    offActionRecord: (id: number): void => {
        actionRecordListenerManager.removeListener(id)
    },

    // 行为执行监听
    onActionExecute: (callback: ActionCallback): number => {
        return actionExecuteListenerManager.addListener(callback)
    },
    offActionExecute: (id: number): void => {
        actionExecuteListenerManager.removeListener(id)
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
