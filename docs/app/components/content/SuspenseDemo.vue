<script setup lang="ts">
// Starts on the client: this demo is about the fallback, and the server would just wait for the post
const run = ref(0)
onMounted(() => run.value = 1)
</script>

<template>
  <div class="grid w-full gap-4">
    <SkeletonSuspense v-if="run" :key="run" label="Loading post">
      <AsyncPost />

      <template #skeleton>
        <h4 class="font-semibold">A title of about this length</h4>

        <p class="mt-1">The sample text stands in for the post until the component finishes loading, and takes up about as much room as the real one.</p>
      </template>
    </SkeletonSuspense>

    <div>
      <UButton size="sm" variant="soft" icon="i-lucide-refresh-cw" label="Load again" @click="run++" />
    </div>
  </div>
</template>
