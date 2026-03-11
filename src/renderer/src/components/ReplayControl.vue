<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
    actionCount: number
    isReplaying: boolean
}>()

const emit = defineEmits<{
    (event: 'play', speedMultiplier: number): void
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
</script>

<template>
    <div class="replay-control">
        <div class="status-bar">
            <span>{{ isReplaying ? '重放中...' : '准备就绪' }}</span>
            <span v-if="isReplaying">速度：{{ speedMultiplier }}x</span>
        </div>

        <div class="speed-control">
            <label>播放速度:</label>
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
            <button
                :disabled="!canPlay"
                class="btn btn-play"
                @click="emit('play', speedMultiplier)"
            >
                开始重放
            </button>
            <button v-if="isReplaying" class="btn btn-stop" @click="emit('stop')">停止重放</button>
        </div>
    </div>
</template>

<style scoped>
.replay-control {
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
    border: 2px solid #ddd;
    background: white;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
}

.speed-btn:hover:not(:disabled) {
    background: #f5f5f5;
}

.speed-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
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
}
</style>
