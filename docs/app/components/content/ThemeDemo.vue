<script setup lang="ts">
const color = ref('#00c16a')
const alpha = ref(20)
const radius = ref(6)
const motion = ref<'shimmer' | 'pulse' | 'none'>('shimmer')

const MOTIONS = [
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'pulse', label: 'Pulse' },
  { value: 'none', label: 'None' },
] as const

const skeletonColor = computed(() => `color-mix(in srgb, ${color.value} ${alpha.value}%, transparent)`)
const motionVars = computed(() => ({
  ...(motion.value === 'shimmer' ? {} : { '--skeleton-shimmer': 'none' }),
  ...(motion.value === 'pulse' ? { '--skeleton-pulse': 'skeleton-pulse' } : {}),
}))
const vars = computed(() => ({ '--skeleton-color': skeletonColor.value, '--skeleton-radius': `${radius.value}px`, ...motionVars.value }))
const css = computed(() => `:root {\n${Object.entries(vars.value).map(([name, value]) => `  ${name}: ${value};`).join('\n')}\n}`)
</script>

<template>
  <div class="not-prose my-5 grid gap-5 rounded-lg border border-default p-5 sm:grid-cols-2">
    <div class="grid content-start gap-3 text-sm">
      <div class="flex items-center justify-between gap-3">
        Color
        <UPopover>
          <UButton color="neutral" variant="outline" size="xs" :label="color">
            <template #leading>
              <span class="size-3.5 rounded-sm" :style="{ background: color }" />
            </template>
          </UButton>

          <template #content>
            <UColorPicker v-model="color" class="p-2" />
          </template>
        </UPopover>
      </div>

      <div class="flex items-center justify-between gap-3">
        Density
        <USlider v-model="alpha" class="w-36" :min="5" :max="60" aria-label="Density" />
      </div>

      <div class="flex items-center justify-between gap-3">
        Radius
        <USlider v-model="radius" class="w-36" :min="0" :max="16" aria-label="Radius" />
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="item in MOTIONS"
          :key="item.value"
          size="xs"
          :color="motion === item.value ? 'primary' : 'neutral'"
          :variant="motion === item.value ? 'solid' : 'outline'"
          :label="item.label"
          @click="motion = item.value"
        />
      </div>
    </div>

    <div :style="vars">
      <Skeleton :loading="true" :persist="false">
        <h3 class="text-lg font-semibold">A title of the note</h3>

        <p class="mt-1">Tune the look on the left and copy the CSS. The bars follow your values.</p>
      </Skeleton>
    </div>

    <pre class="overflow-x-auto rounded-md bg-elevated p-3 text-xs sm:col-span-2"><code>{{ css }}</code></pre>
  </div>
</template>
