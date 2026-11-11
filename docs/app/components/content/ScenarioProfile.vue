<script setup lang="ts">
type User = { firstName: string, lastName: string, company: { title: string }, address: { city: string, stateCode: string } }
type Posts = { posts: { id: number, title: string, body: string, tags: string[], reactions: { likes: number }, views: number }[] }

// Two requests that finish at different times, each with its own skeleton
const user = useDemoFetch<User>('users/1?select=firstName,lastName,company,address', 800)
const posts = useDemoFetch<Posts>('posts?limit=2&skip=4&select=title,body,tags,reactions,views', 1800)
const loading = computed(() => user.loading.value || posts.loading.value)

const sampleUser: User = { firstName: 'First', lastName: 'Lastname', company: { title: 'Job title here' }, address: { city: 'City name', stateCode: 'CA' } }
const samplePosts: Posts = {
  posts: [1, 2].map(id => ({ id, title: 'A post title of about this length here', body: 'The first lines of a post, long enough to fill the two lines the real text will take up in this column once it has loaded from the server.', tags: ['tag', 'tag'], reactions: { likes: 1000 }, views: 1000 })),
}

const reload = () => {
  user.reload()
  posts.reload()
}
</script>

<template>
  <ScenarioFrame request="GET /users/1 + /posts" :loading @reload="reload">
    <div class="-mx-4 -mt-4 h-16 bg-linear-to-r from-primary/25 via-primary/10 to-transparent sm:-mx-5 sm:-mt-5" />

    <Skeleton :of="user" :sample="sampleUser" label="Loading profile" reveal="sequence">
      <template #default="{ data }">
        <div class="-mt-7 flex items-end justify-between gap-3">
          <UAvatar class="ring-4 ring-(--ui-bg)" :alt="`${data.firstName} ${data.lastName}`" size="3xl" />

          <UButton class="transition-[background-color,scale] duration-150 ease-out active:scale-[0.97]" size="sm" label="Follow" />
        </div>

        <h3 class="mt-2 text-lg font-semibold text-highlighted">{{ data.firstName }} {{ data.lastName }}</h3>

        <p class="text-sm text-muted">{{ data.company.title }}, {{ data.address.city }}</p>
      </template>

      <template #error>
        <p class="pt-3 text-sm text-muted">The profile didn't load.</p>
      </template>
    </Skeleton>

    <USeparator class="my-4" />

    <Skeleton :of="posts" :sample="samplePosts" label="Loading posts" reveal="sequence">
      <template #default="{ data }">
        <ul class="grid gap-4">
          <li v-for="post in data.posts" :key="post.id">
            <h4 class="truncate text-sm font-medium text-highlighted">{{ post.title }}</h4>

            <p class="mt-0.5 line-clamp-2 text-sm text-muted">{{ post.body }}</p>

            <div class="mt-1.5 flex items-center gap-1.5">
              <UBadge v-for="tag in post.tags.slice(0, 2)" :key="tag" size="sm" color="neutral" variant="soft" :label="tag" />

              <span class="ml-auto text-xs text-dimmed tabular-nums">{{ post.reactions.likes.toLocaleString('en-US') }} likes</span>
            </div>
          </li>
        </ul>
      </template>

      <template #empty>
        <p class="text-sm text-muted">No posts yet.</p>
      </template>

      <template #error>
        <p class="text-sm text-muted">The posts didn't load.</p>
      </template>
    </Skeleton>
  </ScenarioFrame>
</template>
