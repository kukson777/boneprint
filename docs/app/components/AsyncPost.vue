<script setup lang="ts">
const post = await $fetch<{ title: string, body: string }>('https://dummyjson.com/posts/7?select=title,body&delay=1400')
</script>

<template>
  <div>
    <h4 class="font-semibold text-highlighted">{{ post.title }}</h4>

    <p class="mt-1 text-muted">{{ post.body }}</p>
  </div>
</template>
