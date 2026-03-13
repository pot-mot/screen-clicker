import { ElectronAPI } from '@electron-toolkit/preload'
import type { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi'
import { Action } from '../main/Action'
import IpcRendererEvent = Electron.IpcRendererEvent

declare global {
    type Action =
        | {
              type: 'mousedown'
              event: UiohookMouseEvent
              button: ButtonType
              timestamp: number
          }
        | {
              type: 'mouseup'
              event: UiohookMouseEvent
              button: ButtonType
              timestamp: number
          }
        | {
              type: 'mousemove'
              event: UiohookMouseEvent
              timestamp: number
          }
        | {
              type: 'keydown'
              event: UiohookKeyboardEvent
              key: string
              timestamp: number
          }
        | {
              type: 'keyup'
              event: UiohookKeyboardEvent
              key: string
              timestamp: number
          }
        | {
              type: 'wheel'
              event: UiohookWheelEvent
              timestamp: number
          }
        | {
              type: 'sleep'
              duration: number
              timestamp: number
          }

    type ActionCallback = (event: IpcRendererEvent, action: { action: Action }) => void

    interface Window {
        electron: ElectronAPI
        api: {
            startRecording: () => Promise<void>
            stopRecording: () => Promise<void>
            isRecording: () => Promise<boolean>

            startReplay: (actions: Action[], speedMultiplier?: number) => Promise<void>
            stopReplay: () => Promise<void>
            isReplaying: () => Promise<boolean>

            onAction: (callback: ActionCallback) => Promise<number>
            offAction: (id: number) => Promise<void>
        }
    }
}

export {}
