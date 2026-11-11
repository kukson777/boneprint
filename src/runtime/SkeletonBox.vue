<script setup lang="ts">
withDefaults(defineProps<{
  width?: number | string
  height?: number | string
  radius?: number | string
}>(), { width: '60%', height: '1em', radius: undefined })

const css = (value?: number | string) => typeof value === 'number' ? `${value}px` : value
</script>

<template>
  <span data-skeleton-box aria-hidden="true" :style="{ width: css(width), height: css(height), borderRadius: css(radius) }" />
</template>
