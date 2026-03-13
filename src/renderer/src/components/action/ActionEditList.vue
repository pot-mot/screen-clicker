<script setup lang="ts">
import { Action } from '@renderer/type/Action'

const actions = defineModel<Action[]>({
    required: true
})
</script>

<template>
    <div v-for="action in actions" :key="action.timestamp">
        {{ action }}
    </div>
</template>

<style scoped></style>
