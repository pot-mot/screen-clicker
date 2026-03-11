<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
    actionCount: number
    isReplaying: boolean
}>()

const emit = defineEmits<{
    (event: 'play'): void
    (event: 'stop'): void
}>()

const speedMultiplier = ref(1.0)

const speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '1.0x', value: 1.0 },
    { label: '1.5x', value: 1.5 },
    { label: '2.0x', value: 2.0 }
]

const canPlay = computed(() => {
    return props.actionCount > 0 && !props.isReplaying
})

const statusText = computed(() => {
    if (props.isReplaying) {
        return '▶️ 重放中...'
    } else {
        return '⏸️ 准备就绪'
    }
})

const statusClass = computed(() => {
    return props.isReplaying ? 'status-playing' : 'status-ready'
})
</script>

<template>
    <div class="replay-control">
        <div class="status-bar" :class="statusClass">
            <span class="status-text">{{ statusText }}</span>
            <span v-if="isReplaying" class="speed-badge">速度：{{ speedMultiplier }}x</span>
        </div>

        <div class="speed-control">
            <label class="speed-label">播放速度:</label>
            <div class="speed-buttons">
                <button
                    v-for="option in speedOptions"
                    :key="option.value"
                    :class="['speed-btn', { active: speedMultiplier === option.value }]"
                    :disabled="isReplaying"
                    @click="speedMultiplier = option.value"
                >
                    {{ option.label }}
                </button>
            </div>
        </div>

        <div class="button-group">
            <button :disabled="!canPlay" class="btn btn-play" @click="emit('play')">
                ▶️ 开始重放
            </button>
            <button v-if="isReplaying" class="btn btn-stop" @click="emit('stop')">
                ⏹️ 停止重放
            </button>
        </div>

        <div class="info-box">
            <p>💡 重放说明:</p>
            <ul>
                <li>点击"开始重放"后，窗口将最小化以避免干扰</li>
                <li>重放过程中可以按 ESC 或点击"停止重放"中断</li>
                <li>重放会按照录制的顺序和延迟执行所有操作</li>
                <li>可以通过速度按钮调整播放速度</li>
            </ul>
        </div>

        <div v-if="actionCount === 0" class="warning-box">⚠️ 请先录制一些动作后再进行重放</div>
    </div>
</template>

<style scoped>
.replay-control {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.status-playing {
    background: rgba(255, 255, 100, 0.3);
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

.speed-badge {
    background: rgba(255, 255, 255, 0.3);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9em;
}

.speed-control {
    margin-bottom: 15px;
}

.speed-label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
}

.speed-buttons {
    display: flex;
    gap: 8px;
}

.speed-btn {
    flex: 1;
    padding: 8px;
    border: 2px solid rgba(255, 255, 255, 0.5);
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
}

.speed-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
}

.speed-btn.active {
    background: white;
    color: #f5576c;
    border-color: white;
}

.speed-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

.btn-play {
    background: #4caf50;
    color: white;
}

.btn-play:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.btn-play:disabled {
    background: #ccc;
    cursor: not-allowed;
    opacity: 0.6;
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

.info-box {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 12px;
    font-size: 0.9em;
    margin-bottom: 10px;
}

.info-box p {
    margin: 0 0 8px 0;
    font-weight: bold;
}

.info-box ul {
    margin: 0;
    padding-left: 20px;
}

.info-box li {
    margin: 4px 0;
    line-height: 1.4;
}

.warning-box {
    background: rgba(255, 255, 0, 0.2);
    border: 2px solid rgba(255, 255, 0, 0.5);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    font-weight: bold;
}
</style>
