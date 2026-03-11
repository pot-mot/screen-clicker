<script setup lang="ts">
import { EventType } from '@renderer/components/EventType'
import { Action } from '@renderer/components/Action'

defineProps<{
    actions: Action[]
}>()

const getActionDescription = (action: Action): string => {
    switch (action.type) {
        case EventType.EVENT_MOUSE_PRESSED:
        case EventType.EVENT_MOUSE_RELEASED:
            return `点击`
        case EventType.EVENT_MOUSE_MOVED:
            return `移动到 (${action.x}, ${action.y})`
        case EventType.EVENT_KEY_PRESSED:
        case EventType.EVENT_KEY_RELEASED:
            return `按键 ${action.keycode}`
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
</script>

<template>
    <div class="action-list-container">
        <h3 class="title">录制的动作 ({{ actions.length }})</h3>

        <div v-if="actions.length === 0" class="empty-message">
            <p>暂无录制动作</p>
        </div>

        <div v-else class="action-list">
            <div v-for="(action, index) in actions" :key="index" class="action-item">
                <div class="action-index">{{ index + 1 }}</div>
                <div class="action-info">
                    <div class="action-desc">{{ getActionDescription(action) }}</div>
                    <div class="action-time">{{ formatTime(action.timestamp) }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.action-list-container {
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
    margin: 0 0 15px 0;
    font-size: 1.1em;
}

.empty-message {
    text-align: center;
    padding: 40px 20px;
    color: #999;
}

.action-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 400px;
    overflow-y: auto;
}

.action-item {
    display: flex;
    align-items: center;
    padding: 10px;
    background: #f8f9fa;
    border-radius: 8px;
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

.action-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 12px;
}

.action-desc {
    font-weight: 500;
}

.action-time {
    font-family: 'Courier New', monospace;
    font-size: 0.85em;
    background: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
}

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
