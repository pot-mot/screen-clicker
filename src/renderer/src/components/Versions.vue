<script setup lang="ts">
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
    <ul class="versions">
        <li>Electron v{{ versions.electron }}</li>
        <li>Chromium v{{ versions.chrome }}</li>
        <li>Node v{{ versions.node }}</li>
    </ul>
</template>
