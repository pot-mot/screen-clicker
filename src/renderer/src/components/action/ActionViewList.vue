<script setup lang="ts">
import { Action } from '@renderer/type/Action'
import ViewList from '@renderer/components/list/selectableList/ViewList.vue'

defineProps<{
    actions: Action[]
}>()
</script>

<template>
    <ViewList :lines="actions">
        <template #line="{ item, index }">
            <div>
                <span>{{ index + 1 }}</span>
                {{ item }}
            </div>
        </template>
    </ViewList>
</template>

<style scoped></style>
