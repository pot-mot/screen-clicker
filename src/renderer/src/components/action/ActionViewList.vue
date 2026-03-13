<script setup lang="ts">
import { Action } from '@renderer/type/Action'

defineProps<{
    actions: Action[]
}>()
</script>

<template>
    <div v-for="action in actions" :key="action.timestamp">
        {{ action }}
    </div>
</template>

<style scoped></style>
