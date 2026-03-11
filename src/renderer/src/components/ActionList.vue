<script setup lang="ts">
import { EventType } from '@renderer/components/EventType'
import { Action } from '@renderer/components/Action'
import { ref } from 'vue'

defineProps<{
    actions: Action[]
}>()

const emit = defineEmits<{
    (event: 'deleteActions', index: number[]): void
}>()

const selectedIndices = ref(new Set<number>())

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

const toggleSelection = (index: number, event: MouseEvent): void => {
    if (event.ctrlKey || event.metaKey) {
        // Ctrl/Cmd 键：切换选择状态
        if (selectedIndices.value.has(index)) {
            selectedIndices.value.delete(index)
        } else {
            selectedIndices.value.add(index)
        }
    } else if (event.shiftKey) {
        // 清除文本选择
        window.getSelection()?.removeAllRanges()
        // Shift 键：范围选择
        const lastSelected = Array.from(selectedIndices.value).pop()
        if (lastSelected !== undefined) {
            const start = Math.min(lastSelected, index)
            const end = Math.max(lastSelected, index)
            for (let i = start; i <= end; i++) {
                selectedIndices.value.add(i)
            }
        } else {
            selectedIndices.value.add(index)
        }
    } else {
        // 无修饰键：单选
        if (selectedIndices.value.has(index) && selectedIndices.value.size === 1) {
            selectedIndices.value.delete(index)
        } else {
            selectedIndices.value.clear()
            selectedIndices.value.add(index)
        }
    }
}

const deleteSelected = (): void => {
    if (selectedIndices.value.size > 0) {
        emit('deleteActions', Array.from(selectedIndices.value))
        selectedIndices.value.clear()
    }
}

// 键盘快捷键支持
const handleKeyDown = (event: KeyboardEvent): void => {
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIndices.value.size > 0) {
        event.preventDefault()
        deleteSelected()
    }
}
</script>

<template>
    <div class="action-list-container" tabindex="0" @keydown="handleKeyDown">
        <div class="header">
            <h3 class="title">录制的动作 ({{ actions.length }})</h3>
            <button
                v-if="selectedIndices.size > 0"
                class="delete-selected-btn"
                @click="deleteSelected"
            >
                删除已选择 ({{ selectedIndices.size }})
            </button>
        </div>

        <div v-if="actions.length === 0" class="empty-message">
            <p>暂无录制动作</p>
        </div>

        <div v-else class="action-list">
            <div
                v-for="(action, index) in actions"
                :key="index"
                class="action-item"
                :class="{ selected: selectedIndices.has(index) }"
                @click="toggleSelection(index, $event)"
            >
                <div class="action-index">{{ index + 1 }}</div>
                <div class="action-info">
                    <div class="action-desc">{{ getActionDescription(action) }}</div>
                    <div class="action-time">{{ formatTime(action.timestamp) }}</div>
                </div>
                <button
                    class="delete-single-btn"
                    title="删除此动作"
                    @click.stop="emit('deleteActions', [index])"
                >
                    ×
                </button>
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

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.title {
    margin: 0;
    font-size: 1.1em;
}

.delete-selected-btn {
    padding: 6px 12px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background 0.2s;
}

.delete-selected-btn:hover {
    background: #c82333;
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
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.action-item:hover {
    background: #e9ecef;
}

.action-item.selected {
    background: #667eea;
    color: white;
}

.action-item.selected .action-time {
    background: rgba(255, 255, 255, 0.2);
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

.delete-single-btn {
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #999;
    font-size: 18px;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    margin-left: 8px;
}

.delete-single-btn:hover {
    background: #dc3545;
    color: white;
}

.action-item.selected .delete-single-btn:hover {
    background: white;
    color: #dc3545;
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
