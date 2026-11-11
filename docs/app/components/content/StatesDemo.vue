<script setup lang="ts">
const STATES = [
  { value: 'loading', label: 'Loading' },
  { value: 'content', label: 'Content' },
  { value: 'empty', label: 'Empty' },
  { value: 'error', label: 'Error' },
] as const

const state = ref<(typeof STATES)[number]['value']>('loading')
const post = { title: 'A note from the blog', body: 'Switch the state with the buttons above. The component shows the right part and eases to the new height.' }
const sample = { title: 'A title of the note', body: 'Note text of about the same length as the real one, so the skeleton lines up with the content.' }
</script>

<template>
  <div class="not-prose my-5 rounded-lg border border-default p-5">
    <div class="mb-4 flex flex-wrap gap-2">
      <UButton
        v-for="item in STATES"
        :key="item.value"
        size="sm"
        :color="state === item.value ? 'primary' : 'neutral'"
        :variant="state === item.value ? 'solid' : 'outline'"
        :label="item.label"
        @click="state = item.value"
      />
    </div>

    <Skeleton
      :data="state === 'content' ? post : null"
      :sample
      :persist="false"
      :empty="state === 'empty'"
      :error="state === 'error' ? 'The server returned 500' : undefined"
    >
      <template #default="{ data }">
        <h3 class="text-lg font-semibold text-highlighted">{{ data.title }}</h3>

        <p class="mt-1 text-muted">{{ data.body }}</p>
      </template>

      <template #empty>
        <p class="text-muted">No notes yet.</p>
      </template>

      <template #error="{ error }">
        <p class="text-error">{{ error }}</p>
      </template>
    </Skeleton>
  </div>
</template>
