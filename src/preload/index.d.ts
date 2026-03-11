import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    // 动作类型定义
    type Action = (UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent) & {
      timestamp: number // 相对于录制开始的时间戳
    }

    // 录制状态
    interface RecordingState {
      isRecording: boolean
      startTime: number
      actions: Action[]
      eventTypes: EventType[] // 要监听的事件类型
    }

    interface Window {
        electron: ElectronAPI
        api: {
            startRecording: (eventTypes?: number[]) => Promise<{ success: boolean }>
            stopRecording: () => Promise<{ success: boolean; actions: Action[] }>
            getRecordingState: () => Promise<RecordingState>
            replay: (actions: Action[], speedMultiplier?: number) => Promise<{ success: boolean }>
            stopReplay: () => Promise<{ success: boolean }>
            onRecordingProgress: (
                callback: (data: { count: number; duration: number }) => void
            ) => void
            removeRecordingProgressListener: () => void
        }
    }
}

export {}
