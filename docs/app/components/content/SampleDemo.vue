<script setup lang="ts">
type Post = { title: string, body: string }

const post = useFetch<Post>('https://dummyjson.com/posts/3?select=title,body&delay=1500', { lazy: true, server: false })

// Shorter than the real post on purpose, to show the block easing to its real height
const sample: Post = { title: 'A short sample title', body: 'A sample body that is a good deal shorter than the post the server is about to send.' }

const reload = () => {
  post.clear()
  post.execute()
}
</script>

<template>
  <div class="grid w-full gap-4">
    <Skeleton :of="post" :sample :persist="false">
      <template #default="{ data }">
        <h4 class="font-semibold text-highlighted">{{ data.title }}</h4>

        <p class="mt-1 text-muted">{{ data.body }}</p>
      </template>
    </Skeleton>

    <div>
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Load again" @click="reload" />
    </div>
  </div>
</template>
