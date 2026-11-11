<script setup lang="ts">
const loading = ref(true)
const asBlock = ref(false)
const skipBadge = ref(false)
</script>

<template>
  <div class="grid w-full gap-5">
    <div class="flex flex-wrap gap-x-6 gap-y-2">
      <USwitch v-model="loading" label="Loading" />

      <USwitch v-model="asBlock" label="data-skeleton-block on the text" />

      <USwitch v-model="skipBadge" label="data-skeleton-skip on the badge" />
    </div>

    <Skeleton :loading :persist="false">
      <div class="flex items-start gap-4">
        <UAvatar src="https://dummyjson.com/icon/emilys/128" alt="Emily Johnson" size="xl" />

        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h4 class="font-semibold text-highlighted">Emily Johnson</h4>

            <UBadge :data-skeleton-skip="skipBadge || undefined" color="primary" variant="solid" label="Admin" />
          </div>

          <p class="mt-1 text-muted" :data-skeleton-block="asBlock || undefined">
            Text becomes one bar per line, the avatar and the button become blocks, and table cells become bars.
          </p>

          <UButton class="mt-3" size="sm" label="Follow" />
        </div>
      </div>

      <table class="mt-4 w-full text-sm">
        <tbody>
          <tr class="border-t border-default">
            <th class="py-2 text-left font-medium">Orders</th>

            <td class="py-2 text-right">128</td>
          </tr>

          <tr class="border-t border-default">
            <th class="py-2 text-left font-medium">Returns</th>

            <td class="py-2 text-right">3</td>
          </tr>
        </tbody>
      </table>
    </Skeleton>
  </div>
</template>
