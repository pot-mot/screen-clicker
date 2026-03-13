import { BrowserWindow, ipcMain } from 'electron'
import robot from '@hurdlegroup/robotjs'
import { Action } from './Action'
import { WheelDirection } from 'uiohook-napi'

class ActionReplayer {
    private readonly mainWindow: BrowserWindow
    private isReplaying: boolean = false
    private replayTimeouts: NodeJS.Timeout[] = []

    constructor(window: BrowserWindow) {
        this.mainWindow = window
    }

    // 开始重放
    async startReplay(actions: Action[], speedMultiplier: number = 1.0): Promise<void> {
        if (this.isReplaying || actions.length === 0) return

        this.isReplaying = true

        try {
            for (let i = 0; i < actions.length; i++) {
                if (!this.isReplaying) break

                const action: Action | undefined = actions[i]
                if (action === undefined) continue

                // 执行动作
                await this.executeAction(action, i)

                const nextAction: Action | undefined = actions[i + 1]
                if (nextAction === undefined) continue

                // 计算延迟
                const delay: number = (nextAction.timestamp - action.timestamp) / speedMultiplier
                if (delay > 0) {
                    await this.sleep(delay)
                }
            }

            console.log('Replay is Finished')
        } catch (error) {
            console.error('Replay Error:', error)
        } finally {
            this.isReplaying = false

            this.mainWindow.webContents.send('replayFinished')
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
    private async executeAction(action: Action, index: number): Promise<void> {
        switch (action.type) {
            case 'keydown': {
                const modifier: string[] = []
                if (action.event.shiftKey) modifier.push('shift')
                if (action.event.ctrlKey) modifier.push('control')
                if (action.event.altKey) modifier.push('alt')
                robot.keyToggle(action.key, 'down', modifier)
                break
            }
            case 'keyup': {
                const modifier: string[] = []
                if (action.event.shiftKey) modifier.push('shift')
                if (action.event.ctrlKey) modifier.push('control')
                if (action.event.altKey) modifier.push('alt')
                robot.keyToggle(action.key, 'up', modifier)
                break
            }
            case 'mousedown': {
                robot.moveMouse(action.event.x, action.event.y)
                robot.mouseToggle('down', action.button)
                break
            }
            case 'mouseup': {
                robot.moveMouse(action.event.x, action.event.y)
                robot.mouseToggle('up', action.button)
                break
            }
            case 'mousemove': {
                robot.moveMouse(action.event.x, action.event.y)
                break
            }
            case 'wheel': {
                if (action.event.direction === WheelDirection.VERTICAL) {
                    robot.scrollMouse(0, action.event.amount * -36 * action.event.rotation)
                } else if (action.event.direction === WheelDirection.HORIZONTAL) {
                    robot.scrollMouse(action.event.amount * -36 * action.event.rotation, 0)
                }
                break
            }
            case 'sleep': {
                await this.sleep(action.duration)
                break
            }

            default: {
                console.warn(`未知事件 ${action}`)
                break
            }
        }

        this.sendActionExecute(action, index)
    }

    // 延迟函数
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            const timeout = setTimeout(resolve, ms)
            this.replayTimeouts.push(timeout)
        })
    }

    private sendActionExecute(action: Action, index: number): void {
        this.mainWindow.webContents.send('actionExecute', { action, index })
    }

    getIsReplaying(): boolean {
        return this.isReplaying
    }
}

// 初始化 IPC 处理器
export const initActionReplayer = (mainWindow: BrowserWindow): void => {
    const inputRecorder = new ActionReplayer(mainWindow)

    ipcMain.handle('startReplay', async (_, actions: Action[], speedMultiplier: number = 1.0) => {
        await inputRecorder.startReplay(actions, speedMultiplier)
    })

    ipcMain.handle('stopReplay', () => {
        inputRecorder.stopReplay()
    })

    ipcMain.handle('isReplaying', () => {
        return inputRecorder.getIsReplaying()
    })
}
