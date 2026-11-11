const COMPONENTS = ['Skeleton', 'SkeletonBox', 'SkeletonSuspense']

/**
 * For unplugin-vue-components, and so for `ui({ components: { resolvers } })` from `@nuxt/ui/vite`.
 * Its own file: vite.config runs in Node, which can't load the .vue files the main entry brings.
 */
export const boneprintResolver = () => (name: string) => COMPONENTS.includes(name) ? { name, from: 'boneprint' } : undefined
