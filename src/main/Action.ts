import type { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi'

export type ButtonType = 'left' | 'right' | 'middle'

export type Action =
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
