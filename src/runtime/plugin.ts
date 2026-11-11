import { defineNuxtPlugin, useHead, useRequestEvent, useRoute, useRuntimeConfig } from '#imports'
import type { Plugin } from '#app'
import { boneprintKey, counter, type BoneprintOptions } from './context'

const plugin: Plugin = defineNuxtPlugin((nuxtApp) => {
  // One per app, so on the server one per request
  const place = counter()
  nuxtApp.vueApp.provide(boneprintKey, {
    ...(useRuntimeConfig().public.boneprint as BoneprintOptions),
    place: () => place(useRoute().path),
    hydrating: () => nuxtApp.isHydrating ?? false,
    // A site with a strict Content Security Policy sets event.context.nonce in a server middleware
    head: script => useHead({ script: [{ key: 'boneprint', innerHTML: script, nonce: useRequestEvent()?.context.nonce }] }),
  })
})

export default plugin
