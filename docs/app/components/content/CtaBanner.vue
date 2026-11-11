<template>
  <div class="relative isolate overflow-hidden rounded-2xl border border-default bg-elevated/40 px-6 py-16 text-center sm:py-20">
    <div class="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--ui-primary)_22%,transparent),transparent_65%)]" />

    <div class="absolute inset-0 -z-10 bg-[radial-gradient(var(--ui-border-accented)_1px,transparent_1px)] bg-size-[20px_20px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />

    <h2 class="text-3xl font-bold text-balance text-highlighted sm:text-4xl">Ready when your data isn't</h2>

    <p class="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted">Add the module, wrap your markup, done. Everything else is optional.</p>

    <div class="mt-8 flex flex-wrap justify-center gap-3">
      <UButton size="lg" to="/docs/getting-started/introduction" trailing-icon="i-lucide-arrow-right" label="Get started" />

      <UButton size="lg" color="neutral" variant="outline" to="/docs/api/skeleton" label="Read the API" />
    </div>
  </div>
</template>
