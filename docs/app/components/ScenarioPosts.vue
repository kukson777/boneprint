<script setup lang="ts">
type Posts = { posts: { id: number, title: string, body: string }[] }

const posts = useDemoFetch<Posts>('posts?limit=3&select=title,body', 1200)
const { loading, reload } = posts

const sample: Posts = {
  posts: [1, 2, 3].map(id => ({ id, title: 'A title of about this length', body: 'Two lines of text, about as long as the real thing will be once it has arrived from the server.' })),
}
</script>

<template>
  <ScenarioFrame request="GET /posts?limit=3" :loading @reload="reload">
    <Skeleton :of="posts" :sample reveal="sequence">
      <template #default="{ data }">
        <article v-for="post in data.posts" :key="post.id" class="not-first:mt-4">
          <h3 class="truncate font-medium text-highlighted">{{ post.title }}</h3>

          <p class="mt-0.5 line-clamp-2 text-sm text-muted">{{ post.body }}</p>
        </article>
      </template>

      <template #empty>
        <p class="text-sm text-muted">No posts yet.</p>
      </template>

      <template #error="{ error }">
        <p class="text-sm text-error">{{ error }}</p>
      </template>
    </Skeleton>
  </ScenarioFrame>
</template>
