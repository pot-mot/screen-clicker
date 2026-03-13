<script setup lang="ts">
import { Action } from '@renderer/type/Action'
import ViewList from '@renderer/components/list/selectableList/ViewList.vue'

defineProps<{
    actions: Action[],
    currentIndex?: number | undefined,
}>()
</script>

<template>
    <ViewList :lines="actions">
        <template #line="{ item, index }">
            <div :class="{action: currentIndex === index}">
                <span>{{ index + 1 }}</span>
                {{ item }}
            </div>
        </template>
    </ViewList>
</template>

<style scoped>
.action {
    background-color: var(--primary-color-background);
}
</style>
