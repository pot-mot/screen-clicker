import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
    interface Action {
        type: 'mousedown' | 'mouseup' | 'mousemove' | 'keydown' | 'keyup' | 'mousewheel'
        button?: number
        x?: number
        y?: number
        key?: string
        keyCode?: number
        modifiers?: string[]
        wheelX?: number
        wheelY?: number
        timestamp: number
    }

    interface Window {
        electron: ElectronAPI
        api: {
            startRecording: (eventTypes?: number[]) => Promise<{ success: boolean }>
            stopRecording: () => Promise<{ success: boolean; actions: Action[] }>
            getRecordingState: () => Promise<{ isRecording: boolean; actionCount: number }>
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
