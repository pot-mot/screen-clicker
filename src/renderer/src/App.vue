<script setup lang="ts">
import { ref, watch } from 'vue'
import { Action, ActionCallback } from '@renderer/type/Action'
import ActionViewList from '@renderer/components/action/ActionViewList.vue'
import ActionEditList from '@renderer/components/action/ActionEditList.vue'

const type = ref<'record' | 'replay'>('record')

const actions = ref<Action[]>([])

// 监听 action 事件
const handleAction: ActionCallback = (_, data) => {
    if (data.action.type !== 'mousemove' && data.action.type !== 'wheel')
        actions.value.push(data.action)
}
let actionListenerId: number | undefined

// 记录
const recordStartTime = ref<number>(Date.now())
const isRecording = ref(false)
let recordResetFlag = false

const startRecord = async (): Promise<void> => {
    try {
        isRecording.value = true
        if (actionListenerId !== undefined) {
            window.api.offAction(actionListenerId)
        }
        actionListenerId = await window.api.onAction(handleAction)
        recordStartTime.value = Date.now()
        await window.api.startRecording(recordResetFlag)
    } catch (e) {
        console.error(e)
        alert('StartRecord Fail: ' + e)
    }
}

const stopRecord = async (): Promise<void> => {
    try {
        isRecording.value = false
        if (actionListenerId !== undefined) {
            window.api.offAction(actionListenerId)
        }
        await window.api.stopRecording()
    } catch (e) {
        console.error(e)
        alert('StopRecord Fail: ' + e)
    }
}

const resetRecord = async (): Promise<void> => {
    try {
        isRecording.value = false
        recordResetFlag = true
        if (actionListenerId !== undefined) {
            window.api.offAction(actionListenerId)
        }
        await window.api.stopRecording()
        actions.value = []
    } catch (e) {
        console.error(e)
        alert('ResetRecord Fail: ' + e)
    }
}

// 重放
const isReplaying = ref(false)

const startReplay = async (): Promise<void> => {
    try {
        isReplaying.value = true
        await window.api.startReplay(actions.value)
    } catch (e) {
        console.error(e)
        alert('StartReplay Fail: ' + e)
    }
}

const stopReplay = async (): Promise<void> => {
    try {
        isReplaying.value = false
        await window.api.stopReplay()
    } catch (e) {
        console.error(e)
        alert('StopReplay Fail: ' + e)
    }
}

watch(
    () => type.value,
    () => {
        if (isRecording.value) {
            stopRecord()
        }
        if (isReplaying.value) {
            stopReplay()
        }
    }
)
</script>

<template>
    <div>
        <div>
            <button @click="type = 'record'">record</button>
            <button @click="type = 'replay'">replay</button>
        </div>
        <div v-if="type === 'record'">
            <button v-if="!isRecording" @click="startRecord">start</button>
            <button v-else @click="stopRecord">stop</button>
            <button @click="resetRecord">reset</button>
            <ActionViewList :actions="actions" />
        </div>
        <div v-else-if="type === 'replay'">
            <button v-if="!isReplaying" @click="startReplay">start</button>
            <button v-else @click="stopReplay">stop</button>
            <ActionEditList v-model="actions" />
        </div>
    </div>
</template>

<style scoped></style>
