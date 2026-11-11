<script setup lang="ts">
const loading = ref(true)
</script>

<template>
  <div class="grid w-full gap-4">
    <USwitch v-model="loading" label="Loading" />

    <Skeleton :loading :persist="false">
      <div class="flex h-32 items-end gap-2">
        <div v-for="bar in [40, 75, 55, 90, 65]" :key="bar" class="flex-1 rounded-t-md bg-primary" :style="{ height: `${bar}%` }" />
      </div>

      <template #skeleton>
        <div class="flex h-32 items-end gap-2">
          <SkeletonBox v-for="bar in [60, 60, 60, 60, 60]" :key="bar" class="flex-1" :height="`${bar}%`" />
        </div>
      </template>
    </Skeleton>
  </div>
</template>
