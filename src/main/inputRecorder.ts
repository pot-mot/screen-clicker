import {
    EventType,
    uIOhook,
    type UiohookKeyboardEvent,
    type UiohookMouseEvent,
    type UiohookWheelEvent
} from 'uiohook-napi'
import { BrowserWindow, ipcMain } from 'electron'
import robot from '@hurdlegroup/robotjs'

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

        console.log('Record starting')
    }

    // 停止录制
    stopRecording(): Action[] {
        if (!this.recordingState.isRecording) return []

        iohook.stop()
        this.recordingState.isRecording = false

        console.log(`Record finished`)
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
        console.log(`Replay start\ncount: ${actions.length}\nspeedMultiplier: ${speedMultiplier}`)

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

            console.log('Replay is Finished')
        } catch (error) {
            console.error('Replay Error:', error)
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

        console.log('Replay is stopped')
    }

    // 执行单个动作
    private async executeAction(action: Action): Promise<void> {
        console.log('Replay: ', action)

        switch (action.type) {
            case EventType.EVENT_KEY_PRESSED:
                if (action.keycode !== undefined) {
                    robot.keyToggle(this.getKeyName(action.keycode), 'down')
                }
                break
            case EventType.EVENT_KEY_RELEASED:
                if (action.keycode !== undefined) {
                    robot.keyToggle(this.getKeyName(action.keycode), 'up')
                }
                break

            case EventType.EVENT_MOUSE_PRESSED:
                if (action.x !== undefined && action.y !== undefined) {
                    robot.moveMouse(action.x, action.y)
                }
                robot.mouseClick('left', false)
                break
            case EventType.EVENT_MOUSE_RELEASED:
                robot.mouseClick('left', true)
                break

            case EventType.EVENT_MOUSE_CLICKED:
                if (action.x !== undefined && action.y !== undefined) {
                    robot.moveMouse(action.x, action.y)
                }
                robot.mouseClick('left')
                break

            case EventType.EVENT_MOUSE_MOVED:
                if (action.x !== undefined && action.y !== undefined) {
                    robot.moveMouse(action.x, action.y)
                }
                break

            case EventType.EVENT_MOUSE_WHEEL:
                if (action.direction !== undefined) {
                    const scrollAmount = action.amount || 1
                    if (action.rotation > 90 && action.rotation < 270) {
                        robot.scrollMouse(0, -scrollAmount) // 向上滚动
                    } else {
                        robot.scrollMouse(0, scrollAmount) // 向下滚动
                    }
                }
                break

            default:
                console.warn(`未知事件 ${action}`)
        }
    }

    // 将 keycode 转换为 RobotJS 识别的键名
    private getKeyName(keycode: number): string {
        const keyMap: Record<number, string> = {
            // 字母键
            65: 'a',
            66: 'b',
            67: 'c',
            68: 'd',
            69: 'e',
            70: 'f',
            71: 'g',
            72: 'h',
            73: 'i',
            74: 'j',
            75: 'k',
            76: 'l',
            77: 'm',
            78: 'n',
            79: 'o',
            80: 'p',
            81: 'q',
            82: 'r',
            83: 's',
            84: 't',
            85: 'u',
            86: 'v',
            87: 'w',
            88: 'x',
            89: 'y',
            90: 'z',
            // 数字键
            48: '0',
            49: '1',
            50: '2',
            51: '3',
            52: '4',
            53: '5',
            54: '6',
            55: '7',
            56: '8',
            57: '9',
            // 功能键
            112: 'f1',
            113: 'f2',
            114: 'f3',
            115: 'f4',
            116: 'f5',
            117: 'f6',
            118: 'f7',
            119: 'f8',
            120: 'f9',
            121: 'f10',
            122: 'f11',
            123: 'f12',
            // 特殊键
            8: 'backspace',
            9: 'tab',
            13: 'enter',
            16: 'shift',
            17: 'control',
            18: 'alt',
            20: 'caps_lock',
            27: 'escape',
            32: 'space',
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down',
            46: 'delete',
            91: 'command',
            192: '`',
            189: '-',
            187: '=',
            219: '[',
            221: ']',
            220: '\\',
            186: ';',
            222: "'",
            188: ',',
            190: '.',
            191: '/'
        }
        return keyMap[keycode] || String.fromCharCode(keycode)
    }

    // 延迟函数
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            const timeout = setTimeout(resolve, ms)
            this.replayTimeouts.push(timeout)
        })
    }

    // 获取录制状态
    getRecordingState(): RecordingState {
        return this.recordingState
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
