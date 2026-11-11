import type { App } from 'vue'
// The components bring their styles: nothing else to import
import './skeleton.css'
import { boneprintKey, spaContext, type BoneprintOptions } from './context'
import Skeleton from './Skeleton.vue'
import SkeletonBox from './SkeletonBox.vue'
import SkeletonSuspense from './SkeletonSuspense.vue'

export { Skeleton, SkeletonBox, SkeletonSuspense }
export { forgetSkeletons } from './memory'
export type { BoneprintOptions, Reveal } from './context'

/** `app.use(boneprint, options)`: registers the components globally and sets the defaults. Optional: imported or auto-imported, they work without it. */
export const boneprint = {
  install(app: App, options: Partial<BoneprintOptions> = {}) {
    app.provide(boneprintKey, spaContext(options))
    app.component('Skeleton', Skeleton)
    app.component('SkeletonBox', SkeletonBox)
    app.component('SkeletonSuspense', SkeletonSuspense)
  },
}
