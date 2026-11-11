<script setup lang="ts">
const { forced: forcedColorMode } = useDocusColorMode()
</script>

<template>
  <ThemeToggle v-if="!forcedColorMode" />
</template>
