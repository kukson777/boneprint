<script setup lang="ts">
const loading = ref(true)
</script>

<template>
  <div class="grid w-full gap-4">
    <USwitch v-model="loading" label="Loading" />

    <div class="flex h-48 flex-col rounded-md border border-default p-3">
      <Skeleton class="min-h-0 flex-1" :loading :persist="false">
        <div class="h-full overflow-auto">
          <p v-for="row in 12" :key="row" class="py-1">Row {{ row }} of a list that scrolls</p>
        </div>
      </Skeleton>
    </div>
  </div>
</template>
