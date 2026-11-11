<script setup lang="ts">
const width = ref(100)
const reveal = ref(false)
</script>

<template>
  <div class="grid w-full gap-5">
    <div class="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div class="flex min-w-48 flex-1 items-center gap-3 text-sm">
        Width
        <USlider v-model="width" :min="35" :max="100" aria-label="Width" />
      </div>

      <USwitch v-model="reveal" label="Show the hidden markup" />
    </div>

    <div :class="{ reveal }" :style="{ width: `${width}%` }">
      <Skeleton :loading="true" :persist="false">
        <h4 class="font-semibold">The bars are measured, not guessed</h4>

        <p class="mt-1">Narrow this block and watch the text wrap: each line gets its own bar, and it ends where the line ends.</p>
      </Skeleton>
    </div>
  </div>
</template>

<style scoped>
/* The module hides this text with !important, so showing it takes the same */
.reveal :deep([data-skeleton-ghost] *) {
  color: var(--ui-primary) !important;
  -webkit-text-fill-color: var(--ui-primary) !important;
}
</style>
