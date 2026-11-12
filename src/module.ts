import { addComponent, addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { BoneprintOptions } from './runtime/context'

export type { BoneprintOptions }

export default defineNuxtModule<BoneprintOptions>({
  meta: { name: 'boneprint', configKey: 'boneprint', compatibility: { nuxt: '>=3.0.0' } },
  defaults: { persist: true, debug: false, reveal: 'fade' },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.options.css.push(resolve('./runtime/skeleton.css'))
    nuxt.options.runtimeConfig.public.boneprint = { persist: options.persist, debug: options.debug, reveal: options.reveal }
    addPlugin(resolve('./runtime/plugin'))
    addComponent({ name: 'Skeleton', filePath: resolve('./runtime/Skeleton.vue') })
    addComponent({ name: 'SkeletonBox', filePath: resolve('./runtime/SkeletonBox.vue') })
    addComponent({ name: 'SkeletonSuspense', filePath: resolve('./runtime/SkeletonSuspense.vue') })
    addImports({ name: 'forgetSkeletons', from: resolve('./runtime/memory') })
    addImports({ name: 'useInSkeleton', from: resolve('./runtime/context') })
  },
})
