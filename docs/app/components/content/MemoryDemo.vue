<script setup lang="ts">
type Post = { title: string, body: string }

const ID = 'docs-memory'
const post = useFetch<Post>('https://dummyjson.com/posts/5?select=title,body&delay=1500', { lazy: true, server: false })
const stored = ref('')

const readMemory = () => {
  const shape = JSON.parse(localStorage.getItem('boneprint') ?? '{}')[ID]
  stored.value = shape ? JSON.stringify(shape) : ''
}

// The shape is written when the browser is idle, right after the content appears
const onReveal = () => setTimeout(readMemory, 400)
onMounted(readMemory)

const reload = () => {
  post.clear()
  post.execute()
}

const forget = () => {
  forgetSkeletons()
  readMemory()
}
</script>

<template>
  <div class="grid w-full gap-4">
    <Skeleton :id="ID" :of="post" @reveal="onReveal">
      <template #default="{ data }">
        <h4 class="font-semibold text-highlighted">{{ data.title }}</h4>

        <p class="mt-1 text-muted">{{ data.body }}</p>
      </template>
    </Skeleton>

    <div class="flex flex-wrap gap-2">
      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="Load again" @click="reload" />

      <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-eraser" label="Forget shape" @click="forget" />
    </div>

    <pre class="max-h-32 overflow-auto rounded-md bg-elevated p-3 text-xs break-all whitespace-pre-wrap"><code>{{ stored || 'Nothing remembered yet' }}</code></pre>
  </div>
</template>
