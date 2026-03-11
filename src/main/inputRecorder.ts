import {
    EventType,
    uIOhook,
    type UiohookKeyboardEvent,
    type UiohookMouseEvent,
    type UiohookWheelEvent
} from 'uiohook-napi'
import { BrowserWindow, ipcMain } from 'electron'

// 动作类型定义
export type Action = (UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent) & {
    timestamp: number // 相对于录制开始的时间戳
}

// 录制状态
interface RecordingState {
    isRecording: boolean
    startTime: number
    actions: Action[]
    eventTypes: EventType[] // 要监听的事件类型
}

const iohook = uIOhook

class InputRecorder {
    private mainWindow: BrowserWindow | null = null
    private recordingState: RecordingState = {
        isRecording: false,
        startTime: 0,
        actions: [],
        eventTypes: [EventType.EVENT_KEY_PRESSED] // 默认只监听键盘按下事件
    }

    private isReplaying: boolean = false
    private replayTimeouts: NodeJS.Timeout[] = []

    setMainWindow(window: BrowserWindow): void {
        this.mainWindow = window
    }

    // 启动录制
    startRecording(eventTypes?: EventType[]): void {
        if (this.recordingState.isRecording) return

        this.recordingState = {
            isRecording: true,
            startTime: Date.now(),
            actions: [],
            eventTypes: eventTypes || [EventType.EVENT_KEY_PRESSED]
        }

        // 注册全局事件监听
        iohook.start()

        iohook.on('mousedown', (event: UiohookMouseEvent) => {
            if (!this.recordingState.isRecording || this.isReplaying) return
            if (!this.recordingState.eventTypes.includes(EventType.EVENT_MOUSE_PRESSED)) return
            this.addAction({
                ...event,
                timestamp: Date.now() - this.recordingState.startTime
            })
        })

        iohook.on('mouseup', (event: UiohookMouseEvent) => {
            if (!this.recordingState.isRecording || this.isReplaying) return
            if (!this.recordingState.eventTypes.includes(EventType.EVENT_MOUSE_RELEASED)) return
            this.addAction({
                ...event,
                timestamp: Date.now() - this.recordingState.startTime
            })
        })

        iohook.on('mousemove', (event: UiohookMouseEvent) => {
            if (!this.recordingState.isRecording || this.isReplaying) return
            if (!this.recordingState.eventTypes.includes(EventType.EVENT_MOUSE_MOVED)) return
            // 限制鼠标移动事件的频率
            const lastAction = this.recordingState.actions[this.recordingState.actions.length - 1]
            if (lastAction && lastAction.type === EventType.EVENT_MOUSE_MOVED) return

            this.addAction({
                ...event,
                timestamp: Date.now() - this.recordingState.startTime
            })
        })

        iohook.on('keydown', (event: UiohookKeyboardEvent) => {
            if (!this.recordingState.isRecording || this.isReplaying) return
            if (!this.recordingState.eventTypes.includes(EventType.EVENT_KEY_PRESSED)) return
            this.addAction({
                ...event,
                timestamp: Date.now() - this.recordingState.startTime
            })
        })

        iohook.on('keyup', (event: UiohookKeyboardEvent) => {
            if (!this.recordingState.isRecording || this.isReplaying) return
            if (!this.recordingState.eventTypes.includes(EventType.EVENT_KEY_RELEASED)) return
            this.addAction({
                ...event,
                timestamp: Date.now() - this.recordingState.startTime
            })
        })

        iohook.on('wheel', (event: UiohookWheelEvent) => {
            if (!this.recordingState.isRecording || this.isReplaying) return
            if (!this.recordingState.eventTypes.includes(EventType.EVENT_MOUSE_WHEEL)) return
            this.addAction({
                ...event,
                timestamp: Date.now() - this.recordingState.startTime
            })
        })

        console.log('开始录制')
    }

    // 停止录制
    stopRecording(): Action[] {
        if (!this.recordingState.isRecording) return []

        iohook.stop()
        this.recordingState.isRecording = false

        console.log(`录制结束，共记录 ${this.recordingState.actions.length} 个动作`)
        return this.recordingState.actions
    }

    // 添加动作到列表
    private addAction(action: Action): void {
        this.recordingState.actions.push(action)

        // 定期通知渲染进程更新 UI
        if (this.recordingState.actions.length % 10 === 0 && this.mainWindow) {
            this.mainWindow.webContents.send('recording-progress', {
                count: this.recordingState.actions.length,
                duration: action.timestamp
            })
        }
    }

    // 开始重放
    async replay(actions: Action[], speedMultiplier: number = 1.0): Promise<void> {
        if (this.isReplaying || actions.length === 0) return

        this.isReplaying = true
        console.log(`开始重放，共 ${actions.length} 个动作，速度倍数：${speedMultiplier}`)

        // 隐藏窗口避免干扰
        if (this.mainWindow) {
            this.mainWindow.minimize()
        }

        try {
            for (let i = 0; i < actions.length; i++) {
                if (!this.isReplaying) break

                const action = actions[i]
                const nextAction = actions[i + 1]

                // 执行动作
                await this.executeAction(action)

                // 计算延迟
                const delay = nextAction
                    ? (nextAction.timestamp - action.timestamp) / speedMultiplier
                    : 0
                if (delay > 0 && delay < 10000) {
                    // 限制最大延迟为 10 秒
                    await this.sleep(delay)
                }
            }

            console.log('重放完成')
        } catch (error) {
            console.error('重放过程中出错:', error)
        } finally {
            this.isReplaying = false

            // 恢复窗口
            if (this.mainWindow) {
                this.mainWindow.restore()
                this.mainWindow.focus()
            }
        }
    }

    // 停止重放
    stopReplay(): void {
        this.isReplaying = false

        // 清除所有待执行的超时
        this.replayTimeouts.forEach((timeout) => clearTimeout(timeout))
        this.replayTimeouts = []

        console.log('重放已停止')
    }

    // 执行单个动作
    private async executeAction(action: Action): Promise<void> {
        console.log(action)
        // TODO 实现执行
    }

    // 延迟函数
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            const timeout = setTimeout(resolve, ms)
            this.replayTimeouts.push(timeout)
        })
    }

    // 获取录制状态
    getRecordingState(): { isRecording: boolean; actionCount: number } {
        return {
            isRecording: this.recordingState.isRecording,
            actionCount: this.recordingState.actions.length
        }
    }
}

// 导出单例
export const inputRecorder = new InputRecorder()

// 初始化 IPC 处理器
export function initInputRecorderIPC(mainWindow: BrowserWindow): void {
    inputRecorder.setMainWindow(mainWindow)

    ipcMain.handle('start-recording', (_, eventTypes?: EventType[]) => {
        inputRecorder.startRecording(eventTypes)
        return { success: true }
    })

    ipcMain.handle('stop-recording', () => {
        const actions = inputRecorder.stopRecording()
        return { success: true, actions }
    })

    ipcMain.handle('replay', async (_, actions: Action[], speedMultiplier: number = 1.0) => {
        await inputRecorder.replay(actions, speedMultiplier)
        return { success: true }
    })

    ipcMain.handle('stop-replay', () => {
        inputRecorder.stopReplay()
        return { success: true }
    })

    ipcMain.handle('get-recording-state', () => {
        return inputRecorder.getRecordingState()
    })
}
