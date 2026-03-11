<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    isRecording: boolean
    actionCount: number
    duration: number
}>()

const emit = defineEmits<{
    (event: 'start'): void
    (event: 'stop'): void
}>()

const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

const statusText = computed(() => {
    if (props.isRecording) {
        return '🔴 录制中...'
    } else {
        return '⚪ 就绪'
    }
})

const statusClass = computed(() => {
    return props.isRecording ? 'status-recording' : 'status-ready'
})
</script>

<template>
    <div class="recorder-control">
        <div class="status-bar" :class="statusClass">
            <span class="status-text">{{ statusText }}</span>
            <span class="action-count">{{ actionCount }} 个动作</span>
        </div>

        <div class="info-panel">
            <div class="info-item">
                <span class="label">录制时长:</span>
                <span class="value">{{ formatDuration(duration) }}</span>
            </div>
            <div class="info-item">
                <span class="label">动作数量:</span>
                <span class="value">{{ actionCount }}</span>
            </div>
        </div>

        <div class="button-group">
            <button v-if="!isRecording" class="btn btn-start" @click="emit('start')">
                🎬 开始录制
            </button>
            <button v-else class="btn btn-stop" @click="emit('stop')">⏹️ 停止录制</button>
        </div>

        <div class="tips">
            <p>💡 提示:</p>
            <ul>
                <li>点击"开始录制"后，您的鼠标和键盘操作将被记录</li>
                <li>支持录制鼠标点击、移动、滚轮和键盘按键</li>
                <li>再次点击"停止录制"结束录制</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.recorder-control {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 20px;
    color: white;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 15px;
    font-weight: bold;
}

.status-ready {
    background: rgba(255, 255, 255, 0.2);
}

.status-recording {
    background: rgba(255, 100, 100, 0.3);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

.status-text {
    font-size: 1.2em;
}

.action-count {
    background: rgba(255, 255, 255, 0.3);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9em;
}

.info-panel {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.info-item:last-child {
    border-bottom: none;
}

.info-item .label {
    opacity: 0.9;
}

.info-item .value {
    font-weight: bold;
    font-family: 'Courier New', monospace;
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
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-stop {
    background: #f44336;
    color: white;
}

.btn-stop:hover {
    background: #da190b;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.tips {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    font-size: 0.9em;
}

.tips p {
    margin: 0 0 8px 0;
    font-weight: bold;
}

.tips ul {
    margin: 0;
    padding-left: 20px;
}

.tips li {
    margin: 4px 0;
    line-height: 1.4;
}
</style>
