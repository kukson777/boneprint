<script setup lang="ts">
type Product = { title: string, description: string, thumbnail: string, images: string[] }

// Descriptions of one, two and three lines, so the card really changes shape
const IDS = [24, 71, 12, 23, 51]

const index = ref(0)
const id = computed(() => IDS[index.value]!)

const product = useDemoFetch<Product>(() => `products/${id.value}?select=title,description,thumbnail,images`, 1100)
const { loading, reload } = product

const EFFECTS = [
  { label: 'Fade', value: 'fade' },
  { label: 'Sequence', value: 'sequence' },
  { label: 'Sweep', value: 'sweep' },
]
const effect = ref<'fade' | 'sequence' | 'sweep'>('sequence')

watch([index, effect], reload)

const next =() => index.value = (index.value + 1) % IDS.length

const sample: Product = {
  title: 'A product name of average length',
  description: 'A description about as long as the real ones, so the card takes up nearly the same room while it loads.',
  thumbnail: blankImage,
  images: [blankImage],
}

const viewer = useImageViewer()
const openPhoto = (data: Product) => viewer.open({ src: data.images[0]!, width: 1000, height: 1000, caption: data.title })
</script>

<template>
  <ScenarioFrame :request="`GET /products/${id}`" :loading @reload="reload">
    <UTabs v-model="effect" class="mb-4 w-fit" size="xs" :items="EFFECTS" :content="false" />

    <Skeleton :id="`shop-${id}`" :of="product" :sample label="Loading product" :reveal="effect">
      <template #default="{ data }">
        <div class="relative">
          <button class="press group block w-full cursor-pointer rounded-lg text-left transition-transform duration-150 ease-out will-change-transform active:[transform:scale(0.99)]" type="button" aria-label="Show another product" @click="next">
            <span class="block overflow-hidden rounded-lg bg-elevated">
              <img class="h-56 w-full object-contain p-4" :src="data.thumbnail" :alt="data.title" width="300" height="300" draggable="false">
            </span>

            <span class="mt-3 block text-lg font-semibold text-highlighted">{{ data.title }}</span>

            <span class="mt-1 block text-sm text-muted">{{ data.description }}</span>
          </button>

          <UButton
            class="absolute top-2 right-2 rounded-full transition-[background-color,scale] duration-150 ease-out active:scale-[0.97]"
            size="xs"
            color="neutral"
            variant="solid"
            icon="i-lucide-maximize-2"
            aria-label="Open the photo"
            @click="openPhoto(data)"
          />
        </div>
      </template>

      <template #error>
        <p class="text-sm text-muted">The product didn't load. Press Reload to try again.</p>
      </template>
    </Skeleton>

    <p class="mt-3 text-xs text-dimmed">Click the card to load another product.</p>
  </ScenarioFrame>
</template>

<style scoped>
/* Firefox snaps a flat-scaled photo to whole pixels on every frame, which reads as a shake.
   A rotation too small to see makes it render the in-between positions, as Chrome does. */
@supports (-moz-appearance: none) {
  .press:active {
    transform: scale(0.99) rotate(0.02deg);
  }
}
</style>
