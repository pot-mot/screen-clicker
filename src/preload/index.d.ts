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
            startRecording: (reset: boolean) => Promise<void>
            stopRecording: () => Promise<void>
            isRecording: () => Promise<boolean>

            startReplay: (actions: Action[], speedMultiplier?: number) => Promise<void>
            stopReplay: () => Promise<void>
            isReplaying: () => Promise<boolean>

            onActionRecord: (callback: ActionCallback) => Promise<number>
            offActionRecord: (id: number) => Promise<void>

            onActionExecute: (callback: ActionCallback) => Promise<number>
            offActionExecute: (id: number) => Promise<void>

            onReplayFinished: (callback: () => void) => Promise<number>
            offReplayFinished: (id: number) => Promise<void>
        }
    }
}

export {}
