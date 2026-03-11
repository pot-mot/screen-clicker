<script setup lang="ts">
import { computed } from 'vue'
import {
    type UiohookKeyboardEvent,
    type UiohookMouseEvent,
    type UiohookWheelEvent
} from 'uiohook-napi'

enum EventType {
    EVENT_KEY_PRESSED = 4,
    EVENT_KEY_RELEASED = 5,
    EVENT_MOUSE_CLICKED = 6,
    EVENT_MOUSE_PRESSED = 7,
    EVENT_MOUSE_RELEASED = 8,
    EVENT_MOUSE_MOVED = 9,
    EVENT_MOUSE_WHEEL = 11
}

export type Action = (UiohookKeyboardEvent | UiohookMouseEvent | UiohookWheelEvent) & {
    timestamp: number // 相对于录制开始的时间戳
}

const props = defineProps<{
    actions: Action[]
}>()

const getActionIcon = (action: Action): string => {
    switch (action.type) {
        case EventType.EVENT_MOUSE_PRESSED:
            return '🖱️↓'
        case EventType.EVENT_MOUSE_RELEASED:
            return '🖱️↑'
        case EventType.EVENT_MOUSE_MOVED:
            return '➡️'
        case EventType.EVENT_KEY_PRESSED:
            return '⌨️↓'
        case EventType.EVENT_KEY_RELEASED:
            return '⌨️↑'
        case EventType.EVENT_MOUSE_WHEEL:
            return '🔄'
        default:
            return '❓'
    }
}

const getActionDescription = (action: Action): string => {
    switch (action.type) {
        case EventType.EVENT_MOUSE_PRESSED:
        case EventType.EVENT_MOUSE_RELEASED: {
            return `点击`
        }
        case EventType.EVENT_MOUSE_MOVED:
            return `移动到 (${action.x}, ${action.y})`
        case EventType.EVENT_KEY_PRESSED:
        case EventType.EVENT_KEY_RELEASED: {
            return `按键 ${action.keycode}`
        }
        case EventType.EVENT_MOUSE_WHEEL:
            return `滚轮`
        default:
            return '未知操作'
    }
}

const formatTime = (ms: number): string => {
    const seconds = (ms / 1000).toFixed(2)
    return `${seconds}s`
}

const actionListClass = computed(() => {
    return props.actions.length === 0 ? 'empty-list' : 'has-actions'
})
</script>

<template>
    <div class="action-list-container">
        <h3 class="title">录制的动作 ({{ actions.length }})</h3>

        <div class="list-wrapper" :class="actionListClass">
            <div v-if="actions.length === 0" class="empty-message">
                <div class="empty-icon">📝</div>
                <p>暂无录制动作</p>
                <p class="hint">开始录制后，您的操作将显示在这里</p>
            </div>

            <div v-else class="action-list">
                <div v-for="(action, index) in actions" :key="index" class="action-item">
                    <div class="action-index">{{ index + 1 }}</div>
                    <div class="action-icon">{{ getActionIcon(action) }}</div>
                    <div class="action-info">
                        <div class="action-desc">{{ getActionDescription(action) }}</div>
                        <div class="action-time">{{ formatTime(action.timestamp) }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.action-list-container {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
    margin: 0 0 15px 0;
    font-size: 1.1em;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
}

.list-wrapper {
    max-height: 400px;
    overflow-y: auto;
}

.empty-list {
    max-height: none;
}

.empty-message {
    text-align: center;
    padding: 40px 20px;
    color: #999;
}

.empty-icon {
    font-size: 3em;
    margin-bottom: 10px;
}

.empty-message p {
    margin: 5px 0;
}

.hint {
    font-size: 0.9em;
    color: #bbb;
}

.action-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.action-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.action-item:hover {
    background: #e9ecef;
    transform: translateX(4px);
}

.action-index {
    width: 30px;
    height: 30px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.9em;
    flex-shrink: 0;
}

.action-icon {
    font-size: 1.5em;
    margin: 0 12px;
    flex-shrink: 0;
}

.action-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.action-desc {
    font-weight: 500;
    color: #333;
}

.action-time {
    font-family: 'Courier New', monospace;
    font-size: 0.85em;
    color: #666;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
}

/* 滚动条样式 */
.action-list::-webkit-scrollbar {
    width: 6px;
}

.action-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.action-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.action-list::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
