<script setup lang="ts">
import { ref } from 'vue'
import { EventType } from '@renderer/components/EventType'

defineProps<{
    isRecording: boolean
    actionCount: number
    duration: number
}>()

const emit = defineEmits<{
    (event: 'start', eventTypes: EventType[]): void
    (event: 'stop'): void
}>()

// 事件类型选项
const availableEventTypes = ref([
    { type: EventType.EVENT_MOUSE_PRESSED, label: '鼠标按下', enabled: true },
    { type: EventType.EVENT_MOUSE_RELEASED, label: '鼠标释放', enabled: false },
    { type: EventType.EVENT_MOUSE_MOVED, label: '鼠标移动', enabled: false },
    { type: EventType.EVENT_MOUSE_WHEEL, label: '鼠标滚轮', enabled: false },
    { type: EventType.EVENT_KEY_PRESSED, label: '键盘按下', enabled: false },
    { type: EventType.EVENT_KEY_RELEASED, label: '键盘释放', enabled: false }
])

const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getSelectedEventTypes = (): EventType[] => {
    return availableEventTypes.value.filter((item) => item.enabled).map((item) => item.type)
}

const handleStart = (): void => {
    const selectedTypes = getSelectedEventTypes()
    if (selectedTypes.length === 0) {
        alert('请至少选择一种事件类型')
        return
    }
    emit('start', selectedTypes)
}
</script>

<template>
    <div class="recorder-control">
        <div class="status-bar">
            <span>{{ isRecording ? '录制中...' : '就绪' }}</span>
            <span>{{ actionCount }} 个动作</span>
        </div>

        <div class="info-panel">
            <div class="info-item">
                <span>录制时长:</span>
                <span>{{ formatDuration(duration) }}</span>
            </div>
            <div class="info-item">
                <span>动作数量:</span>
                <span>{{ actionCount }}</span>
            </div>
        </div>

        <div class="button-group">
            <button v-if="!isRecording" class="btn btn-start" @click="handleStart">开始录制</button>
            <button v-else class="btn btn-stop" @click="emit('stop')">停止录制</button>
        </div>

        <div v-if="!isRecording" class="event-types">
            <p>监听事件类型:</p>
            <div class="checkbox-group">
                <label v-for="item in availableEventTypes" :key="item.type" class="checkbox-item">
                    <input v-model="item.enabled" type="checkbox" />
                    <span>{{ item.label }}</span>
                </label>
            </div>
        </div>
    </div>
</template>

<style scoped>
.recorder-control {
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
    font-weight: bold;
    background: #f0f0f0;
}

.info-panel {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;
}

.info-item:last-child {
    border-bottom: none;
}

.button-group {
    margin-bottom: 15px;
}

.btn {
    width: 100%;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 1.1em;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-start {
    background: #4caf50;
    color: white;
}

.btn-start:hover {
    background: #45a049;
}

.btn-stop {
    background: #f44336;
    color: white;
}

.btn-stop:hover {
    background: #da190b;
}

.event-types {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 12px;
}

.section-title {
    margin: 0 0 10px 0;
    font-weight: bold;
    font-size: 0.95em;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-item {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-size: 0.9em;
}

.checkbox-item input[type='checkbox'] {
    cursor: pointer;
    width: 16px;
    height: 16px;
}

.checkbox-item span {
    user-select: none;
}
</style>
