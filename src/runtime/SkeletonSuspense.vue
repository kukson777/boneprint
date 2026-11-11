<script setup lang="ts">
import Skeleton from './Skeleton.vue'

defineProps<{
  /** Read to screen readers while suspended. */
  label?: string
}>()

const emit = defineEmits<{ reveal: [] }>()
</script>

<template>
  <Suspense @resolve="emit('reveal')">
    <slot />

    <template #fallback>
      <Skeleton :label :loading="true" :persist="false">
        <slot name="skeleton" />
      </Skeleton>
    </template>
  </Suspense>
</template>
