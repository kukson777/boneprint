<script setup lang="ts">
type Comments = { comments: { id: number, body: string, likes: number, user: { fullName: string } }[] }

const inbox = useDemoFetch<Comments>('comments?limit=5', 1200)
const { loading, reload } = inbox

const sample: Comments = {
  comments: [1, 2, 3, 4, 5].map(id => ({ id, body: 'The last message in the conversation', likes: 1, user: { fullName: 'First Lastname' } })),
}

const received = (index: number) => ['2m', '14m', '1h', '3h', '1d'][index]
</script>

<template>
  <ScenarioFrame request="GET /comments" :loading @reload="reload">
    <Skeleton :of="inbox" :sample label="Loading messages" reveal="sequence">
      <template #default="{ data }">
        <ul class="-m-2 grid gap-0.5">
          <li
            v-for="(thread, index) in data.comments"
            :key="thread.id"
            class="flex items-center gap-3 rounded-lg p-2 transition-colors duration-150 hover:bg-elevated/60"
          >
            <UAvatar :alt="thread.user.fullName" />

            <div class="min-w-0 flex-1">
              <div class="flex items-baseline justify-between gap-3">
                <p class="truncate text-sm text-highlighted" :class="thread.likes > 3 ? 'font-semibold' : 'font-medium'">{{ thread.user.fullName }}</p>

                <span class="shrink-0 text-xs text-dimmed tabular-nums">{{ received(index) }}</span>
              </div>

              <p class="truncate text-sm text-muted">{{ thread.body }}</p>
            </div>

            <span v-if="thread.likes > 3" class="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
          </li>
        </ul>
      </template>

      <template #empty>
        <p class="text-sm text-muted">No messages yet. New conversations appear here.</p>
      </template>

      <template #error>
        <p class="text-sm text-muted">The messages didn't load. Press Reload to try again.</p>
      </template>
    </Skeleton>
  </ScenarioFrame>
</template>
