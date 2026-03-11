<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import RecorderControl from './components/RecorderControl.vue'
import ActionList from './components/ActionList.vue'
import ReplayControl from './components/ReplayControl.vue'
import { Action } from '@renderer/components/Action'

const isRecording = ref(false)
const actions = ref<Action[]>([])
const recordingDuration = ref(0)
const isReplaying = ref(false)
let progressInterval: number | null = null

// 开始录制
const handleStartRecording = async (eventTypes: number[]): Promise<void> => {
    try {
        await window.api.startRecording(eventTypes)
        isRecording.value = true
        actions.value = []
        recordingDuration.value = 0

        // 启动进度更新
        progressInterval = window.setInterval(async () => {
            recordingDuration.value = Date.now() - (Date.now() - recordingDuration.value)
            const recordingState = await window.api.getRecordingState()
            actions.value = recordingState.actions
        }, 100)
    } catch (error) {
        console.error('启动录制失败:', error)
        alert('启动录制失败')
    }
}

// 停止录制
const handleStopRecording = async (): Promise<void> => {
    try {
        const result = await window.api.stopRecording()
        isRecording.value = false
        actions.value = result.actions

        if (progressInterval) {
            clearInterval(progressInterval)
            progressInterval = null
        }

        recordingDuration.value =
            actions.value.length > 0 ? actions.value[actions.value.length - 1].timestamp : 0
    } catch (error) {
        console.error('停止录制失败:', error)
        alert('停止录制失败')
    }
}

// 开始重放
const handleReplay = async (): Promise<void> => {
    if (actions.value.length === 0) return

    try {
        isReplaying.value = true
        await window.api.replay(actions.value, 1.0)
    } catch (error) {
        console.error('重放失败:', error)
        isReplaying.value = false
        alert('重放失败')
    }
}

// 停止重放
const handleStopReplay = async (): Promise<void> => {
    try {
        await window.api.stopReplay()
        isReplaying.value = false
    } catch (error) {
        console.error('停止重放失败:', error)
    }
}

// 监听录制进度
onMounted(() => {
    window.api.onRecordingProgress((data) => {
        // 可以在这里更新更多实时信息
        console.log('录制进度:', data)
    })
})

onUnmounted(() => {
    if (progressInterval) {
        clearInterval(progressInterval)
    }
    window.api.removeRecordingProgressListener()
})
</script>

<template>
    <div class="container">
        <header class="header">
            <h1>按键精灵</h1>
        </header>

        <main class="main-content">
            <div class="left-panel">
                <RecorderControl
                    :is-recording="isRecording"
                    :action-count="actions.length"
                    :duration="recordingDuration"
                    @start="handleStartRecording"
                    @stop="handleStopRecording"
                />

                <ReplayControl
                    :action-count="actions.length"
                    :is-replaying="isReplaying"
                    @play="handleReplay"
                    @stop="handleStopReplay"
                />
            </div>

            <div class="right-panel">
                <ActionList :actions="actions" />
            </div>
        </main>

        <footer class="footer">
            <p>提示：录制时请最小化本窗口，重放时窗口会自动最小化</p>
        </footer>
    </div>
</template>

<style scoped>
.container {
    min-height: 100vh;
    padding: 20px;
}

.header {
    text-align: center;
    margin-bottom: 30px;
}

.main-content {
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
}

.left-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.footer {
    text-align: center;
    margin-top: 30px;
    padding: 15px;
    font-size: 0.9em;
}

@media (max-width: 900px) {
    .main-content {
        grid-template-columns: 1fr;
    }
}
</style>
