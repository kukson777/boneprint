<script setup lang="ts">
// Items rise into place when the grid scrolls into view. The server renders everything
// visible; only a grid still below the fold on mount is hidden to be revealed
const features = [
  { icon: 'i-lucide-scan-line', title: 'Shaped by your markup', description: 'A bar for every line of text, a block for every image and button. No separate loading template to keep in sync.' },
  { icon: 'i-lucide-zap', title: 'Before JavaScript', description: 'One script in the head draws the skeleton before the first paint, ahead of the app itself.' },
  { icon: 'i-lucide-history', title: 'No jump on reload', description: 'The shape of the last content is remembered and applied on the next visit at the same window width.' },
  { icon: 'i-lucide-braces', title: 'Understands useFetch and useQuery', description: 'Pass the result to :of and loading, empty responses and errors are handled. Slot data stays typed.' },
  { icon: 'i-lucide-shield', title: 'Remembers geometry only', description: 'No text, markup or attributes in storage. Turn memory off, or clear it on sign-out.' },
  { icon: 'i-lucide-palette', title: 'Styled with plain CSS', description: 'Color, radius and animation are CSS variables, so dark mode works like everything else.' },
  { icon: 'i-lucide-feather', title: 'Nuxt and Vue', description: 'A module for Nuxt, a plugin for Vue with Vite. The shimmer runs on the compositor and stays off the main thread.' },
  { icon: 'i-lucide-accessibility', title: 'Accessible', description: 'Skeletons are hidden from screen readers, loading is announced, and reduced motion is respected.' },
]

const grid = useTemplateRef('grid')
const state = ref<'shown' | 'hidden' | 'revealed'>('shown')

onMounted(() => {
  const el = grid.value
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || el.getBoundingClientRect().top < window.innerHeight) return
  state.value = 'hidden'
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    state.value = 'revealed'
    observer.disconnect()
  }, { threshold: 0.15 })
  observer.observe(el)
  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <ul ref="grid" class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
    <li
      v-for="(feature, i) in [...features, null]"
      :key="feature?.title ?? 'docs'"
      class="transition duration-250 ease-out"
      :class="[state === 'hidden' ? 'translate-y-2.5 opacity-0' : '', feature ? '' : 'flex h-full flex-col justify-center gap-4 bg-muted/50 p-4']"
      :style="{ transitionDelay: state === 'revealed' ? `${i * 100}ms` : '0ms' }"
    >
      <UPageFeature v-if="feature" orientation="vertical" :icon="feature.icon" :title="feature.title" :description="feature.description" />

      <template v-else>
        <span class="text-lg font-semibold text-highlighted">Dive into the docs now</span>

        <div>
          <UButton to="/docs/getting-started/introduction" trailing-icon="i-lucide-arrow-right" label="Start reading docs" />
        </div>
      </template>
    </li>
  </ul>
</template>
