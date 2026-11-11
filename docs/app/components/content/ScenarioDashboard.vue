<script setup lang="ts">
type Order = { id: number, customer: string, products: number, quantity: number, total: number }

const API = 'https://dummyjson.com'

// Orders only carry a user id, so a real dashboard joins them with the customers
const orders = useDemoData<Order[]>('demo-orders', async () => {
  const [{ carts }, { users }] = await Promise.all([
    $fetch<{ carts: { id: number, userId: number, total: number, totalProducts: number, totalQuantity: number }[] }>(`${API}/carts?limit=5&select=userId,total,totalProducts,totalQuantity&delay=1600`),
    $fetch<{ users: { id: number, firstName: string, lastName: string }[] }>(`${API}/users?limit=0&select=firstName,lastName`),
  ])
  const names = new Map(users.map(user => [user.id, `${user.firstName} ${user.lastName}`]))
  return carts.map(cart => ({ id: cart.id, customer: names.get(cart.userId) ?? `Customer ${cart.userId}`, products: cart.totalProducts, quantity: cart.totalQuantity, total: cart.total }))
})
const { loading, reload } = orders

const sample: Order[] = [1, 2, 3, 4, 5].map(id => ({ id, customer: 'First Lastname', products: 4, quantity: 10, total: 1000 }))

const money = (value: number) => `$${Math.round(value).toLocaleString('en-US')}`
const total = (rows: Order[], key: 'total' | 'quantity') => rows.reduce((sum, row) => sum + row[key], 0)

const stats = (rows: Order[]) => [
  { label: 'Revenue', value: money(total(rows, 'total')) },
  { label: 'Orders', value: String(rows.length) },
  { label: 'Items sold', value: String(total(rows, 'quantity')) },
]

/** The line under the stats: each order's total, scaled to the box. */
const trend = (rows: Order[]) => {
  const values = rows.map(row => Math.sqrt(row.total))
  const top = Math.max(...values)
  return values.map((value, index) => `${(index / (values.length - 1)) * 100},${30 - (value / top) * 26}`).join(' ')
}

const paid = (order: Order) => order.id % 3 !== 0

const columns = [
  { accessorKey: 'id', header: 'Order' },
  { accessorKey: 'customer', header: 'Customer' },
  { accessorKey: 'status', header: 'Status' },
  { accessorKey: 'total', header: () => 'Total' },
]
</script>

<template>
  <ScenarioFrame request="GET /carts + /users" :loading @reload="reload">
    <Skeleton :of="orders" :sample label="Loading orders" reveal="sweep">
      <template #default="{ data }">
        <div class="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div v-for="(stat, index) in stats(data)" :key="stat.label" class="relative overflow-hidden rounded-lg p-3 ring ring-default">
            <p class="text-sm text-muted">{{ stat.label }}</p>

            <p class="mt-0.5 text-2xl font-semibold text-highlighted tabular-nums">{{ stat.value }}</p>

            <svg v-if="index === 0" class="absolute right-3 bottom-3 h-8 w-24 text-primary" viewBox="0 0 100 32" preserveAspectRatio="none" fill="none" aria-hidden="true">
              <polyline :points="trend(data)" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
            </svg>
          </div>
        </div>

        <UTable class="mt-3" :data :columns :ui="{ th: 'py-2 text-xs', td: 'py-2.5' }">
          <template #id-cell="{ row }">
            <span class="font-mono text-xs text-muted">#{{ row.original.id }}</span>
          </template>

          <template #customer-cell="{ row }">
            <span class="flex items-center gap-2 font-medium text-highlighted">
              <UAvatar :alt="row.original.customer" size="xs" />
              {{ row.original.customer }}
            </span>
          </template>

          <template #status-cell="{ row }">
            <UBadge size="sm" variant="subtle" :color="paid(row.original) ? 'success' : 'warning'" :label="paid(row.original) ? 'Paid' : 'Pending'" />
          </template>

          <template #total-cell="{ row }">
            <span class="font-medium text-highlighted tabular-nums">{{ money(row.original.total) }}</span>
          </template>
        </UTable>
      </template>

      <template #error>
        <p class="text-sm text-muted">The orders didn't load. Press Reload to try again.</p>
      </template>
    </Skeleton>
  </ScenarioFrame>
</template>
