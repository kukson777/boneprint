<script setup lang="ts">
type Reveal = 'fade' | 'sequence' | 'sweep'
type Posts = { posts: { id: number, title: string, body: string }[] }

const MODES = [
  { label: 'fade', value: 'fade' },
  { label: 'sequence', value: 'sequence' },
  { label: 'sweep', value: 'sweep' },
]

const posts = useDemoFetch<Posts>('posts?limit=3&skip=9&select=title,body', 1000)
const { loading, reload } = posts
const reveal = ref<Reveal>('sequence')

const sample: Posts = {
  posts: [1, 2, 3].map(id => ({ id, title: 'A post title of about this length', body: 'The first lines of a post, long enough to fill one or two lines once it has loaded.' })),
}

watch(reveal, reload)
</script>

<template>
  <ScenarioFrame class="my-5" request="GET /posts" :loading @reload="reload">
    <UTabs v-model="reveal" class="mb-4 w-fit" size="xs" :items="MODES" :content="false" />

    <Skeleton :of="posts" :sample :reveal :persist="false">
      <template #default="{ data }">
        <ul class="grid gap-3">
          <li v-for="post in data.posts" :key="post.id">
            <h4 class="truncate font-medium text-highlighted">{{ post.title }}</h4>

            <p class="truncate text-sm text-muted">{{ post.body }}</p>
          </li>
        </ul>
      </template>
    </Skeleton>
  </ScenarioFrame>
</template>
