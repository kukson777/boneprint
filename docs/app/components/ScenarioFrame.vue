<script setup lang="ts">
const props = defineProps<{ request: string, loading: boolean }>()
defineEmits<{ reload: [] }>()

const elapsed = ref('')
let started = 0

watch(() => props.loading, (loading) => {
  if (loading) started = performance.now()
  else elapsed.value = `${((performance.now() - started) / 1000).toFixed(1)} s`
}, { immediate: true })
</script>

<template>
  <div class="not-prose flex flex-col overflow-hidden rounded-xl bg-default text-left shadow-sm ring ring-default">
    <div class="flex items-center gap-2.5 border-b border-default bg-elevated/50 py-2 pr-2 pl-3.5">
      <span class="size-1.5 shrink-0 rounded-full transition-colors duration-200" :class="loading ? 'bg-warning motion-safe:animate-pulse' : 'bg-success'" />

      <code class="min-w-0 flex-1 truncate font-mono text-xs text-muted">{{ request }}</code>

      <span class="shrink-0 font-mono text-xs text-dimmed tabular-nums">{{ loading ? 'loading' : elapsed }}</span>

      <UButton
        class="shrink-0 transition-[background-color,scale] duration-150 ease-out active:scale-[0.97]"
        size="xs"
        variant="soft"
        icon="i-lucide-refresh-cw"
        label="Reload"
        :ui="{ leadingIcon: loading ? 'motion-safe:animate-spin' : '' }"
        @click="$emit('reload')"
      />
    </div>

    <div class="flex-1 p-4 sm:p-5">
      <slot />
    </div>
  </div>
</template>
