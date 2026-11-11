<script setup lang="ts" generic="T">
import { computed, getCurrentInstance, inject, onBeforeUnmount, ref, unref, watch, type MaybeRef } from 'vue'
import { boneprintKey, spaContext, type Reveal } from './context'
import { bootScript, recall, skeletonEngine, type SkeletonRoot } from './engine'
import { memoryEpoch, remember } from './memory'

type AsyncLike = { data: MaybeRef<T | null | undefined>, status: MaybeRef<string>, error: MaybeRef<unknown> }

const props = withDefaults(defineProps<{
  /** What useFetch or useAsyncData returned. */
  of?: AsyncLike
  data?: T | null
  /** Stands in for `data` while there is none, to draw the shape from. */
  sample?: T
  loading?: boolean
  empty?: boolean
  error?: unknown
  /** Key for the remembered shape. Defaults to the page plus this skeleton's order on it. */
  id?: string
  /** Read to screen readers while loading. */
  label?: string
  /** Remember this skeleton's shape between visits. Defaults to the module's `persist` option. */
  persist?: boolean
  /** How content replaces the skeleton. Defaults to the module's `reveal` option. */
  reveal?: Reveal
}>(), { loading: undefined, empty: undefined, persist: undefined })

const emit = defineEmits<{ reveal: [] }>()

const slots = defineSlots<{
  default?: (props: { data: T }) => unknown
  /** Shown instead of the measured skeleton, for what doesn't measure well: a logo, a chart. */
  skeleton?: () => unknown
  empty?: () => unknown
  error?: (props: { error: unknown }) => unknown
}>()

const instance = getCurrentInstance()!
// Nuxt provides this from its plugin; a Vue app without app.use(boneprint) gets the defaults
const config = inject(boneprintKey, spaContext, true)
// Not import.meta.client: plain Vite leaves it undefined
const client = !import.meta.server
const placeInTree = config.place()
const memoryId = computed(() => props.id ?? placeInTree)
const persist = props.persist ?? config.persist
const mode = computed(() => props.reveal ?? config.reveal)

// Bound at all, even to null, means the slot renders from data
const driven = computed(() => !!props.of || 'data' in (instance.vnode.props ?? {}))
const data = computed(() => props.of ? unref(props.of.data) : props.data)
const error = computed(() => props.error ?? (props.of ? unref(props.of.error) : undefined))

// ponytail: 'idle' counts as loading, because server:false renders idle on the server and that's
// exactly when a skeleton is wanted. With immediate:false, pass :empty until execute() is called.
const empty = computed(() => {
  if (props.empty !== undefined) return props.empty
  const value = data.value
  // Without this a successful null would shimmer forever
  return !!props.of && unref(props.of.status) === 'success' && (value == null || (Array.isArray(value) && !value.length))
})

const state = computed(() => {
  if (props.loading) return 'skeleton'
  if (error.value) return 'error'
  if (empty.value) return 'empty'
  return driven.value && data.value == null ? 'skeleton' : 'content'
})

// During hydration the DOM must match the server's; the boot script has already applied the shape
const shape = computed(() =>
  client && persist && state.value === 'skeleton' && data.value == null && !config.hydrating()
    ? recall(memoryId.value)
    : null)

const ghostData = computed(() => (data.value ?? props.sample) as T)
const hasGhost = computed(() => !driven.value || ghostData.value != null)
const FALLBACK = [100, 90, 60]

// Not <Transition appear>: on the server Vue renders appear content inside an inert <template>, so there'd be no skeleton before hydration
const holdFirst = client && !config.hydrating()

if (import.meta.server && state.value === 'skeleton' && !slots.skeleton) config.head?.(bootScript())

if (import.meta.env?.DEV && client) {
  const sketch = (value: unknown): unknown => {
    if (typeof value === 'string') return 'x'.repeat(Math.min(value.length, 120))
    if (Array.isArray(value)) return value.slice(0, 3).map(sketch)
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, sketch(item)]))
    return value
  }

  watch(data, (value) => {
    if (value != null && driven.value && props.sample == null) console.info('[boneprint] No sample, so the first load has nothing to measure. Paste this as :sample', JSON.stringify(sketch(value), null, 2))
  }, { once: true })
}

const pane = ref<SkeletonRoot | null>(null)
const content = ref<HTMLElement | null>(null)
const live = new Set<SkeletonRoot>()
let engine: ReturnType<typeof skeletonEngine> | undefined
let observer: ResizeObserver | undefined
let mutations: MutationObserver | undefined

const paintLive = () => engine!.paint(...[...live].filter(root => root.isConnected))
const onLoad = () => paintLive()

watch(pane, (root, previous) => {
  if (previous) {
    observer?.unobserve(previous)
    mutations?.disconnect()
    previous.removeEventListener('load', onLoad, true)
    live.delete(previous)
  }
  if (!root) return

  engine ??= skeletonEngine(document)
  observer ??= new ResizeObserver(paintLive)
  // Slot content renders inside <Transition>, so this component's own update hook never sees it change
  mutations ??= new MutationObserver(paintLive)
  mutations.observe(root.firstElementChild!, { subtree: true, childList: true, characterData: true, attributes: true })
  root.skeletonLive = true
  root.skeletonShape = shape.value ?? root.skeletonShape
  live.add(root)
  source = root.skeletonShape ? 'memory' : data.value != null ? 'data' : props.sample != null ? 'sample' : driven.value ? 'generic lines' : 'slot'
  report('loading', `loading · ${source}`)
  observer.observe(root)
  root.addEventListener('load', onLoad, true)
  document.fonts.ready.then(() => live.size && paintLive())
}, { flush: 'post' })

// The epoch this content appeared in: after forgetSkeletons() it must not be written back
let seen = 0
const save = () => {
  if (persist && content.value && seen === memoryEpoch()) remember(memoryId.value, content.value, (engine ??= skeletonEngine(document)).measure)
}

const imageSettled = (event: Event) => {
  delete (event.target as HTMLElement).dataset.skeletonImage
}

watch(content, (element) => {
  seen = memoryEpoch()
  if (!element) return
  // After the reveal: sequence moves the pieces, and a shape measured mid-flight would be off by that much
  const moving = element.getAnimations({ subtree: true }).filter(animation => animation.effect?.getComputedTiming().iterations !== Infinity)
  // Safari has no requestIdleCallback
  Promise.allSettled(moving.map(animation => animation.finished)).then(() => (window.requestIdleCallback ?? setTimeout)(save))

  // ponytail: images present when the content appears. One added later just loads without a placeholder.
  for (const image of element.querySelectorAll('img')) {
    if (!image.complete) image.dataset.skeletonImage = ''
  }
  element.addEventListener('load', imageSettled, true)
  element.addEventListener('error', imageSettled, true)
}, { flush: 'post' })

onBeforeUnmount(() => {
  save()
  observer?.disconnect()
  mutations?.disconnect()
})

const box = ref<HTMLElement | null>(null)
const SWEEP = 420
// Content may reach above and beside the box on negative margins, so only the shrinking edge is cut
const BOTTOM_ONLY = 'inset(-100vmax -100vmax 0 -100vmax)'
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'
const SWEEP_EASE = 'cubic-bezier(0.77, 0, 0.175, 1)'

let wasSkeleton = state.value === 'skeleton'
let startHeight = 0
let startWidth = 0
let resizing: Animation | undefined
let source = ''

// The debug overlay is plain CSS on these attributes. On with ?skeleton-debug, the `debug` option or data-skeleton-debug around it
const report = (status: 'loading' | 'still' | 'moved', label: string) => {
  const element = box.value
  if (!element || !(config.debug || location.search.includes('skeleton-debug') || element.closest('[data-skeleton-debug]'))) return
  element.dataset.skeletonStatus = status
  element.dataset.skeletonReport = label
}

const WAVE = 320
const PIECE = 240
// ponytail: long lists stop staggering here, and rows past the fold never show it anyway
const MAX_PIECES = 300

/** One wave down the box: a bone and the piece replacing it share a position, so they share a moment. */
const waveDelay = (element: Element) => {
  const area = box.value!.getBoundingClientRect()
  // The box itself can read 0 here: the leaving pane is already out of flow and the content isn't in yet
  const height = Math.max(area.height, startHeight) || 1
  return Math.min(Math.max((element.getBoundingClientRect().top - area.top) / height, 0), 1) * WAVE
}

const playSequence = (root: Element) => {
  const pieces = [...root.querySelectorAll<HTMLElement>('*:not(svg *)')]
    .filter(element => !element.children.length || element.localName === 'svg' || [...element.childNodes].some(node => node.nodeType === 3 && node.nodeValue!.trim()))
    .slice(0, MAX_PIECES)
  for (const element of pieces) {
    element.animate({ opacity: [0, 1], transform: ['translateY(4px)', 'translateY(0)'] }, { duration: PIECE, delay: waveDelay(element), easing: EASE, fill: 'backwards' })
  }
}

const fadeBones = (pane: Element) => {
  const bones = [...pane.querySelectorAll('[data-skeleton-layer] i:not([data-line])')].slice(0, MAX_PIECES)
  for (const bone of bones) bone.animate({ opacity: [1, 0] }, { duration: PIECE, delay: waveDelay(bone), easing: EASE, fill: 'forwards' })
}

const playing = () => wasSkeleton && !!box.value?.dataset.skeletonReveal

const onEnter = (element: Element) => {
  if (!playing()) return
  if (mode.value === 'sequence') playSequence(element)
  // Far past the edges, or rings, shadows and anything on a negative margin get cut off
  if (mode.value === 'sweep') element.animate({ clipPath: ['inset(-100vmax 100% -100vmax -100vmax)', 'inset(-100vmax -100vmax -100vmax -100vmax)'] }, { duration: SWEEP, easing: SWEEP_EASE })
}

const onLeave = (element: Element) => {
  if (playing() && mode.value === 'sequence') fadeBones(element)
  // Held at the end: the timer that removes this pane can fire a frame after the animation stops
  if (playing() && mode.value === 'sweep') element.animate({ clipPath: ['inset(-100vmax -100vmax -100vmax 0%)', 'inset(-100vmax -100vmax -100vmax 100%)'] }, { duration: SWEEP, easing: SWEEP_EASE, fill: 'forwards' })
}

const onAfterEnter = () => {
  if (wasSkeleton) emit('reveal')
  wasSkeleton = false
  if (box.value) delete box.value.dataset.skeletonReveal
}

watch(state, (next, previous) => {
  wasSkeleton = previous === 'skeleton' && next === 'content'
  startHeight = box.value?.offsetHeight ?? 0
  startWidth = box.value?.offsetWidth ?? 0
  if (box.value && wasSkeleton && mode.value !== 'fade' && !matchMedia('(prefers-reduced-motion: reduce)').matches) box.value.dataset.skeletonReveal = mode.value
}, { flush: 'pre' })

// When the content turns out a different size, neighbours below slide instead of snapping
watch(state, (next, previous) => {
  resizing?.cancel()
  const height = box.value?.offsetHeight
  if (previous === 'skeleton' && box.value) {
    const movedWidth = Math.abs(box.value.offsetWidth - startWidth)
    const movedHeight = Math.abs(box.value.offsetHeight - startHeight)
    if (movedWidth || movedHeight) report('moved', `moved ${movedWidth}×${movedHeight}px · ${source}`)
    else report('still', `nothing moved · ${source}`)
  }
  if (!height || height === startHeight || matchMedia('(prefers-reduced-motion: reduce)').matches) return
  // Going to a skeleton, the old content stays up for the hold, so it keeps its room until then
  const hold = next === 'skeleton' ? parseFloat(getComputedStyle(box.value!).getPropertyValue('--skeleton-hold')) : 0
  resizing = box.value!.animate(
    { height: [`${startHeight}px`, `${height}px`], clipPath: [BOTTOM_ONLY, BOTTOM_ONLY] },
    { duration: 200, easing: 'ease', delay: Number.isNaN(hold) ? 150 : hold, fill: 'backwards' },
  )
}, { flush: 'post' })
</script>

<template>
  <div ref="box" class="skeleton-reveal" :aria-busy="state === 'skeleton' || undefined">
    <span v-if="label && state === 'skeleton'" class="skeleton-status" role="status">{{ label }}</span>

    <Transition
      name="skeleton"
      :duration="mode === 'sweep' ? SWEEP : mode === 'sequence' ? WAVE + PIECE : undefined"
      @enter="onEnter"
      @leave="onLeave"
      @after-enter="onAfterEnter"
    >
      <div v-if="state === 'skeleton' && slots.skeleton" key="custom" aria-hidden="true" inert>
        <slot name="skeleton" />
      </div>

      <div v-else-if="state === 'skeleton'" key="skeleton" ref="pane" data-skeleton :class="{ 'skeleton-hold': holdFirst }" :data-skeleton-id="persist ? memoryId : undefined" aria-hidden="true" inert :style="shape ? { minHeight: `${shape.height}px` } : undefined">
        <div data-skeleton-ghost>
          <template v-if="!shape">
            <slot v-if="hasGhost" :data="ghostData" />

            <template v-else>
              <div v-for="width in FALLBACK" :key="width" data-skeleton-block :style="{ width: `${width}%`, height: '0.75em', margin: '0.5em 0' }" />
            </template>
          </template>
        </div>

        <div data-skeleton-layer />
      </div>

      <div v-else-if="state === 'error'" key="error">
        <slot name="error" :error />
      </div>

      <div v-else-if="state === 'empty'" key="empty">
        <slot name="empty">
          <slot :data="(data as T)" />
        </slot>
      </div>

      <div v-else key="content" ref="content">
        <slot :data="(data as T)" />
      </div>
    </Transition>
  </div>
</template>
