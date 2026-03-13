<script setup lang="ts">
import { ref, toRaw, watch } from 'vue'
import { Action, ActionCallback } from '@renderer/type/Action'
import ActionViewList from '@renderer/components/action/ActionViewList.vue'
import ActionEditList from '@renderer/components/action/ActionEditList.vue'

const type = ref<'record' | 'replay'>('record')

const actions = ref<Action[]>([])

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
        actionExecuteListenerId = await window.api.onActionExecute(handleActionExecute)
        await window.api.startReplay(toRaw(actions.value))
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
