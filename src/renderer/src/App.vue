<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Action, ActionCallback } from '@renderer/type/Action'
import ActionViewList from '@renderer/components/action/ActionViewList.vue'
import ActionEditList from '@renderer/components/action/ActionEditList.vue'
import {
    mountClickOutside,
    umountClickOutside
} from '@renderer/components/list/selectableList/useClickOutside.ts'
import { cloneDeepReadonlyRaw } from '@renderer/utils/type/cloneDeepReadonly.ts'

const type = ref<'record' | 'replay'>('record')

const actions = ref<Action[]>([])

onMounted(() => {
    mountClickOutside()
})
onBeforeUnmount(() => {
    umountClickOutside()
})

// 监听 actionRecord 事件
const handleActionRecord: ActionCallback = (_, data) => {
    if (data.action.type !== 'mousemove' && data.action.type !== 'wheel')
        actions.value.push(data.action)
}
let actionRecordListenerId: number | undefined

// 监听 actionExecute 事件
const handleActionExecute: ActionCallback = (_, data) => {
    console.log('Execute: ', data.action)
}
let actionExecuteListenerId: number | undefined

// 监听 replayFinished 事件
const handleReplayFinished = () => {
    isReplaying.value = false
    console.log('Replay Finished')
}
let replayFinishedListenerId: number | undefined

// 记录
const isRecording = ref(false)
let recordResetFlag = false

const startRecord = async (): Promise<void> => {
    try {
        isRecording.value = true
        if (actionRecordListenerId !== undefined) {
            window.api.offActionRecord(actionRecordListenerId)
        }
        actionRecordListenerId = await window.api.onActionRecord(handleActionRecord)
        await window.api.startRecording(recordResetFlag)
    } catch (e) {
        console.error(e)
        alert('StartRecord Fail: ' + e)
    }
}

const stopRecord = async (): Promise<void> => {
    try {
        isRecording.value = false
        if (actionRecordListenerId !== undefined) {
            window.api.offActionRecord(actionRecordListenerId)
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
        if (actionRecordListenerId !== undefined) {
            window.api.offActionRecord(actionRecordListenerId)
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
        if (actionExecuteListenerId !== undefined) {
            window.api.offActionExecute(actionExecuteListenerId)
        }
        if (replayFinishedListenerId !== undefined) {
            window.api.offReplayFinished(replayFinishedListenerId)
        }
        actionExecuteListenerId = await window.api.onActionExecute(handleActionExecute)
        replayFinishedListenerId = await window.api.onReplayFinished(handleReplayFinished)
        await window.api.startReplay(cloneDeepReadonlyRaw(actions.value))
    } catch (e) {
        console.error(e)
        alert('StartReplay Fail: ' + e)
    }
}

const stopReplay = async (): Promise<void> => {
    try {
        isReplaying.value = false
        if (actionRecordListenerId !== undefined) {
            window.api.offActionRecord(actionRecordListenerId)
        }
        if (replayFinishedListenerId !== undefined) {
            window.api.offReplayFinished(replayFinishedListenerId)
        }
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
            <ActionViewList v-if="isRecording" :actions="actions" />
            <ActionEditList v-else v-model="actions" />
        </div>
        <div v-else-if="type === 'replay'">
            <button v-if="!isReplaying" @click="startReplay">start</button>
            <button v-else @click="stopReplay">stop</button>
            <ActionEditList v-model="actions" />
        </div>
    </div>
</template>

<style scoped></style>
