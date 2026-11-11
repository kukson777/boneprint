<script setup lang="ts">
type Posts = { posts: { id: number, title: string, reactions: { likes: number } }[] }

const posts = useFetch<Posts>('https://dummyjson.com/posts?limit=3&select=title,reactions&delay=1200', { lazy: true, server: false })
const sample: Posts = { posts: [1, 2, 3].map(id => ({ id, title: 'A post title of about this length', reactions: { likes: 100 } })) }

const reload = () => {
  posts.clear()
  posts.execute()
}
</script>

<template>
  <div class="grid w-full gap-4">
    <Skeleton :of="posts" :sample>
      <template #default="{ data }">
        <ul class="grid gap-3">
          <li v-for="post in data.posts" :key="post.id" class="flex items-center justify-between gap-4">
            <span class="font-medium text-highlighted">{{ post.title }}</span>

            <UBadge color="neutral" variant="subtle" :label="`${post.reactions.likes} likes`" />
          </li>
        </ul>
      </template>
    </Skeleton>

    <div>
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Load again" @click="reload" />
    </div>
  </div>
</template>
