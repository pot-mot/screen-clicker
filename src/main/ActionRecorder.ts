import { EventType, uIOhook } from 'uiohook-napi'
import { BrowserWindow, ipcMain } from 'electron'
import { Action, ButtonType } from './Action'
import { Keys } from '@hurdlegroup/robotjs'

const iohook = uIOhook

const codeKeyEntries = Object.entries({
    backspace: 14,
    tab: 15,
    enter: 28,
    capslock: 58,
    escape: 1,
    space: 57,
    pageup: 3657,
    pagedown: 3665,
    end: 3663,
    home: 3655,
    left: 57419,
    up: 57416,
    right: 57421,
    down: 57424,
    insert: 3666,
    delete: 3667,
    0: 11,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: 10,
    a: 30,
    b: 48,
    c: 46,
    d: 32,
    e: 18,
    f: 33,
    g: 34,
    h: 35,
    i: 23,
    j: 36,
    k: 37,
    l: 38,
    m: 50,
    n: 49,
    o: 24,
    p: 25,
    q: 16,
    r: 19,
    s: 31,
    t: 20,
    u: 22,
    v: 47,
    w: 17,
    x: 45,
    y: 21,
    z: 44,
    numpad_0: 82,
    numpad_1: 79,
    numpad_2: 80,
    numpad_3: 81,
    numpad_4: 75,
    numpad_5: 76,
    numpad_6: 77,
    numpad_7: 71,
    numpad_8: 72,
    numpad_9: 73,
    'numpad_*': 55,
    'numpad_+': 78,
    'numpad_-': 74,
    'numpad_.': 83,
    'numpad_/': 3637,
    f1: 59,
    f2: 60,
    f3: 61,
    f4: 62,
    f5: 63,
    f6: 64,
    f7: 65,
    f8: 66,
    f9: 67,
    f10: 68,
    f11: 87,
    f12: 88,
    f13: 91,
    f14: 92,
    f15: 93,
    f16: 99,
    f17: 100,
    f18: 101,
    f19: 102,
    f20: 103,
    f21: 104,
    f22: 105,
    f23: 106,
    f24: 107,
    semicolon: 39,
    equal: 13,
    comma: 51,
    minus: 12,
    period: 52,
    slash: 53,
    backquote: 41,
    bracketleft: 26,
    backslash: 43,
    bracketright: 27,
    quote: 40,
    control: 29,
    right_control: 3613,
    alt: 56,
    right_alt: 3640,
    shift: 42,
    right_shift: 54,
    command: 3675,
    right_command: 3676,
    numpad_lock: 69,
    scroll_lock: 70,
    printscreen: 3639
} as const)

const codeToKey = (code: number): Keys | string | undefined => {
    for (const [key, value] of codeKeyEntries) {
        if (value === code) return key
    }
    return undefined
}

const buttonToStr = (num: unknown): ButtonType | undefined => {
    switch (num) {
        case 1:
            return 'left'
        case 2:
            return 'right'
        case 3:
            return 'middle'
    }
    return undefined
}

class ActionRecorder {
    private readonly mainWindow: BrowserWindow
    private isRecording: boolean = false

    private startTime: number | null = null
    private stopTime: number | null = null
    private duration: number = 0
    private accumulatedPauseTime: number = 0
    private lastPauseStart: number | null = null

    constructor(window: BrowserWindow) {
        this.mainWindow = window

        iohook.on('input', (event) => {
            switch (event.type) {
                case EventType.EVENT_KEY_PRESSED: {
                    const key = codeToKey(event.keycode)
                    if (!key) return
                    this.sendAction({
                        type: 'keydown',
                        event,
                        key,
                        timestamp: this.getAdjustTimestamp()
                    })
                    break
                }
                case EventType.EVENT_KEY_RELEASED: {
                    const key = codeToKey(event.keycode)
                    if (!key) return
                    this.sendAction({
                        type: 'keyup',
                        event,
                        key,
                        timestamp: this.getAdjustTimestamp()
                    })
                    break
                }
                case EventType.EVENT_MOUSE_MOVED: {
                    this.sendAction({
                        type: 'mousemove',
                        event,
                        timestamp: this.getAdjustTimestamp()
                    })
                    break
                }
                case EventType.EVENT_MOUSE_PRESSED: {
                    const button = buttonToStr(event.button)
                    if (!button) return
                    this.sendAction({
                        type: 'mousedown',
                        event,
                        button,
                        timestamp: this.getAdjustTimestamp()
                    })
                    break
                }
                case EventType.EVENT_MOUSE_RELEASED: {
                    const button = buttonToStr(event.button)
                    if (!button) return
                    this.sendAction({
                        type: 'mouseup',
                        event,
                        button,
                        timestamp: this.getAdjustTimestamp()
                    })
                    break
                }
                case EventType.EVENT_MOUSE_WHEEL: {
                    this.sendAction({
                        type: 'wheel',
                        event,
                        timestamp: this.getAdjustTimestamp()
                    })
                    break
                }
            }
        })
    }

    private getAdjustTimestamp = (): number => {
        if (!this.startTime) return Date.now()
        return Date.now() - this.startTime - this.accumulatedPauseTime
    }

    private sendAction(action: Action): void {
        this.mainWindow.webContents.send('action', { action })
    }

    // 启动录制
    startRecording(reset: boolean): void {
        if (this.isRecording) return

        if (reset) {
            this.startTime = null
            this.stopTime = null
            this.duration = 0
            this.accumulatedPauseTime = 0
            this.lastPauseStart = null
        }

        this.isRecording = true

        if (this.startTime === null) {
            this.startTime = Date.now()
        } else if (this.lastPauseStart !== null) {
            const pauseDuration = Date.now() - this.lastPauseStart
            this.accumulatedPauseTime += pauseDuration
            this.lastPauseStart = null
        }

        iohook.start()
    }

    // 停止录制
    stopRecording(): void {
        if (!this.isRecording) return
        this.isRecording = false
        this.lastPauseStart = Date.now()
        iohook.stop()

        if (this.startTime !== null) {
            this.stopTime = Date.now()
            this.duration = this.stopTime - this.startTime - this.accumulatedPauseTime
        }
    }

    getIsRecording(): boolean {
        return this.isRecording
    }

    getDuration(): number {
        return this.duration
    }
}

// 初始化 IPC 处理器
export const initActionRecorder = (mainWindow: BrowserWindow): void => {
    const inputRecorder = new ActionRecorder(mainWindow)

    ipcMain.handle('startRecording', (_, reset: boolean) => {
        inputRecorder.startRecording(reset)
    })

    ipcMain.handle('stopRecording', () => {
        inputRecorder.stopRecording()
    })

    ipcMain.handle('isRecording', () => {
        return inputRecorder.getIsRecording()
    })
}
