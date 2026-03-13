<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { Action, ActionCallback, ActionWithIndexCallback } from '@renderer/type/Action'
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

// 记录
const isRecording = ref(false)
let recordResetFlag = false

// 监听 actionRecord 事件
const handleActionRecord: ActionCallback = (_, data) => {
    actions.value.push(data.action)
}
let actionRecordListenerId: number | undefined

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
        actions.value.splice(actions.value.length - 1, 1)
    } catch (e) {
        console.error(e)
        alert('StopRecord Fail: ' + e)
    }
}

// 重放
const isReplaying = ref(false)
const currentReplayIndex = ref<number>()

// 监听 actionExecute 事件
const handleActionExecute: ActionWithIndexCallback = (_, data) => {
    console.log('Execute: ', data.action)
    currentReplayIndex.value = data.index
}
let actionExecuteListenerId: number | undefined

// 监听 replayFinished 事件
const handleReplayFinished = () => {
    isReplaying.value = false
    console.log('Replay Finished')
}
let replayFinishedListenerId: number | undefined

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
    <div class="main-container">
        <div class="operation-container">
            <button @click="type = 'record'">record</button>
            <button @click="type = 'replay'">replay</button>
        </div>
        <div v-if="type === 'record'" class="action-container">
            <div class="operation-container">
                <button v-if="!isRecording" @click="startRecord">start record</button>
                <button v-else @click="stopRecord">stop record</button>
            </div>
            <div class="action-list">
                <ActionViewList v-if="isRecording" :actions="actions" />
                <ActionEditList v-else v-model="actions" />
            </div>
        </div>
        <div v-else-if="type === 'replay'" class="action-container">
            <div class="operation-container">
                <button v-if="!isReplaying" @click="startReplay">start replay</button>
                <button v-else @click="stopReplay">stop replay</button>
            </div>
            <div class="action-list">
                <ActionViewList v-if="isReplaying" :actions="actions" :currentIndex="currentReplayIndex" />
                <ActionEditList v-else v-model="actions" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.main-container {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr;
    grid-row-gap: 0.5rem;
    padding: 0.5rem;
    overflow: hidden;
}

.action-container {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-row-gap: 0.5rem;
    overflow: hidden;
}

.operation-container {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5rem;
}

.operation-container > button {
    flex-shrink: 0;
}

.action-list {
    overflow-y: auto;
}
</style>
