import { getCurrentInstance, type InjectionKey } from 'vue'

export type Reveal = 'fade' | 'sequence' | 'sweep'
export type BoneprintOptions = { persist: boolean, debug: boolean, reveal: Reveal }

/** What Skeleton needs from the app around it: Nuxt and plain Vue fill it differently. */
export type BoneprintContext = BoneprintOptions & {
  /** The key of a remembered shape when no id is given. */
  place: () => string
  /** True while the DOM must match what the server sent. */
  hydrating: () => boolean
  /** Server only: puts the script that draws remembered shapes before the app loads. */
  head?: (script: string) => void
}

export const boneprintKey: InjectionKey<BoneprintContext> = Symbol('boneprint')

const defaults: BoneprintOptions = { persist: true, debug: false, reveal: 'fade' }

/**
 * The page plus the order skeletons were set up on it, counted from zero on every page. Not useId():
 * its count runs on across client-side navigation, so a page opened from a link got a different key.
 * ponytail: something remounting on the same page counts on. Pass id when that matters.
 */
export const counter = () => {
  let page = ''
  let count = 0
  return (path: string) => {
    if (path !== page) {
      page = path
      count = 0
    }
    return `${path}#${count++}`
  }
}

const spaPlace = counter()

/** A Vue app with no server: nothing to hydrate, and the router, if any, knows the page. */
export const spaContext = (options: Partial<BoneprintOptions> = {}): BoneprintContext => ({
  ...defaults,
  ...options,
  // A hash router keeps the page out of location.pathname
  place: () => spaPlace((getCurrentInstance()?.proxy as { $route?: { path: string } } | undefined)?.$route?.path ?? location.pathname),
  hydrating: () => false,
})
