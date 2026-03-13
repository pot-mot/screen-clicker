<script setup lang="ts">
import { Action } from '@renderer/type/Action'
import EditList from '@renderer/components/list/selectableList/EditList.vue'

const actions = defineModel<Action[]>({
    required: true
})

const createDefaultAction = (): Action => {
    return {
        type: 'mousedown',
        event: {
            type: 7,
            time: 0,
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            x: 0,
            y: 0,
            button: 1,
            clicks: 0,
        },
        button: 'left',
        timestamp: 0
    }
}
</script>

<template>
    <EditList
        :default-line="createDefaultAction"
        v-model:lines="actions"
    >
        <template #line="{ item, index }">
            <div>
                <span>{{ index + 1 }}</span>
                {{ item }}
            </div>
        </template>
    </EditList>
</template>

<style scoped></style>
