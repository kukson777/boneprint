---
seo:
  title: Skeletons that match your markup
  description: Skeletons for Nuxt and Vue, drawn from your real markup. A bar for every line of text, a block for every image. No separate loading template.
---

::u-page-hero{orientation="horizontal" :ui='{"container":"lg:items-start","wrapper":"lg:pt-14"}'}
#top
  :::hero-background
  :::

#headline
  :::u-button{size="sm" variant="subtle" color="primary" class="rounded-full px-3 py-1 text-sm font-semibold" to="/docs/getting-started/introduction" trailing-icon="i-lucide-arrow-right"}
  Nuxt 3 & 4 · Vue 3
  :::

#title
Skeletons that [match your markup]{.text-primary}.

#description
A loading state for Nuxt and Vue that you never have to build. It lays out your real markup invisibly and draws a bar over every line of text and a block over every image, before JavaScript loads.

#links
  :::u-button{size="xl" to="/docs/getting-started/quick-start" trailing-icon="i-lucide-arrow-right"}
  Get started
  :::

  :::u-button{size="xl" color="neutral" variant="outline" to="/docs/guide/under-the-hood"}
  How it works
  :::

#default
  :::scenario-shop
  :::
::

::u-page-section
#title
Built for real screens

#description
Real requests to a live API. Press Reload on any of them to see the loading state again.

#default
  :::scenario-grid
  :::
::

::u-page-section
#title
A loading state you don't maintain

#description
Change the card and the skeleton changes with it, because it is the card.

#default
  :::feature-grid
  :::
::

::u-page-section
#title
All the code it takes

#description
Pass the `useFetch` result to `:of` and describe the shape with `sample`. The component handles loading, empty responses and errors.

#default
  :::code-and-result
  ```vue
  <script setup lang="ts">
  const posts = useFetch<Posts>('https://dummyjson.com/posts?limit=3', {
    lazy: true,
    server: false,
  })

  const sample: Posts = {
    posts: [1, 2, 3].map(id => ({
      id,
      title: 'A title of about this length',
      body: 'Two lines of text, about as long as the real thing.',
    })),
  }
  </script>

  <template>
    <Skeleton :of="posts" :sample>
      <template #default="{ data }">
        <article v-for="post in data.posts" :key="post.id">
          <h3>{{ post.title }}</h3>

          <p>{{ post.body }}</p>
        </article>
      </template>

      <template #empty>No posts yet</template>

      <template #error="{ error }">{{ error }}</template>
    </Skeleton>
  </template>
  ```
  :::
::

::u-page-section
  :::cta-banner
  :::
::
