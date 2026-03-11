import type { UiohookKeyboardEvent, UiohookMouseEvent, UiohookWheelEvent } from 'uiohook-napi'

export type Action = (UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent) & {
    timestamp: number // 相对于录制开始的时间戳
}
