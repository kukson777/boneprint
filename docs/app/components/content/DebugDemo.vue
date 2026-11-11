<script setup lang="ts">
type Post = { title: string, body: string }

const post = useDemoFetch<Post>('posts/3?select=title,body', 1200)
const SHORT: Post = { title: 'A short sample title', body: 'A sample body much shorter than the real post.' }

// The last real response, which is as good as a sample can get
const real = ref<Post>()
watch(post.data, (value) => {
  if (value) real.value = value
})

const matching = ref(false)
const xray = ref(false)
const sample = computed(() => matching.value && real.value ? real.value : SHORT)
</script>

<template>
  <ScenarioFrame request="GET /posts/3" :loading="post.loading.value" @reload="post.reload">
    <div class="mb-4 flex flex-wrap gap-x-6 gap-y-2">
      <USwitch v-model="matching" label="Sample of the real length" />

      <USwitch v-model="xray" label="X-ray" />
    </div>

    <div data-skeleton-debug :data-skeleton-xray="xray || undefined">
      <Skeleton :of="post" :sample :persist="false">
        <template #default="{ data }">
          <div class="pt-6">
            <h4 class="font-semibold text-highlighted">{{ data.title }}</h4>

            <p class="mt-1 text-muted">{{ data.body }}</p>
          </div>
        </template>
      </Skeleton>
    </div>
  </ScenarioFrame>
</template>
