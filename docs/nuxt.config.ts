// GitHub Pages serves the site from a subfolder: NUXT_APP_BASE_URL=/boneprint/,
// and NUXT_SITE_URL is the bare origin — nuxt-site-config adds the base itself
const base = process.env.NUXT_APP_BASE_URL ?? '/'
const subfolder = base !== '/'
const siteUrl = process.env.NUXT_SITE_URL || 'http://localhost:3000'

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

// Docus and its modules don't fully support a subfolder: og:url, the canonical link and
// llms.txt are built from the bare origin, Nuxt Content puts the base inside /raw/, and
// the markdown twins of pages exist only under /raw/ on a static host. Fixed in the
// generated files
function fixSubfolderUrls(text: string) {
  const origin = new URL(siteUrl).origin
  const path = base.replace(/\/$/, '')
  return text
    .replaceAll(`${origin}/raw${path}.md`, `${origin}/raw/index.md`)
    .replaceAll(`${origin}/raw${path}/`, `${origin}/raw/`)
    .replace(new RegExp(`(type="text/markdown" href="${escape(origin)})(?!/raw/)(/[^"]*")`, 'g'), '$1/raw$2')
    .replace(new RegExp(`${escape(origin)}(?!${escape(path)}(?:[/"'?#)\\s]|$))`, 'gm'), origin + path)
}

const description = 'Skeleton loading states for Nuxt and Vue, measured from the real markup: no hand-made copy of the layout, and the shape is remembered between visits.'

export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['../src/module', 'nuxt-image-viewer'],
  site: {
    name: 'Boneprint',
    // The public address — llms.txt, the sitemap and OG images need it
    url: siteUrl,
  },
  compatibilityDate: '2026-11-01',
  // Node 24 has sqlite built in, so no native package to compile
  content: { experimental: { sqliteConnector: 'native' } },
  // Above the sticky header of the site
  imageViewer: { zIndex: 100 },
  llms: {
    title: 'Boneprint',
    description,
    full: { title: 'Boneprint', description },
    notes: [
      'When to use boneprint: a Nuxt 3/4 or Vue 3 app needs skeleton loading states and should not keep a second, hand-drawn copy of each layout. The skeleton is the real slot rendered with sample data and measured.',
      'Install with `npm install boneprint`. Nuxt: `modules: [\'boneprint/nuxt\']`, components and `forgetSkeletons()` / `useInSkeleton()` are auto-imported. Vue: `import { Skeleton } from \'boneprint\'` or `app.use(boneprint, options)`; `boneprintResolver()` from `boneprint/resolver` for unplugin-vue-components. No CSS import is needed.',
      'Usage: `<Skeleton :of="useFetch(...) or a TanStack Query result" :sample>` with `#default="{ data }"` (typed), `#empty` and `#error="{ error }"`. Without a data layer, set `:data`, `:loading`, `:empty`, `:error` by hand. `sample` mirrors the response with text of typical length and only draws the first visit; later visits use the shape remembered in localStorage per `id`.',
      'Rules: the slot mounts twice (measured copy and content), so keep fetching outside `<Skeleton>` or skip it where `useInSkeleton()` is true. Give an `id` to a skeleton inside tabs or anything that remounts. `data-skeleton-block` draws an element as one block, `data-skeleton-skip` leaves it out, the `#skeleton` slot with `<SkeletonBox>` draws a custom one. Theme with `--skeleton-*` CSS variables. Call `forgetSkeletons()` on sign-out.',
      'Reading this documentation as an agent: /llms-full.txt contains every page in one file, and any page is also available as Markdown under /raw/<path>.md.',
    ],
  },
  // robots.txt and /.well-known only work at the root of a domain — in a subfolder they
  // are never read, and both modules refuse to build there: no robots.txt, and agent
  // discovery gets the bare origin it insists on
  ...(subfolder && {
    robots: { robotsTxt: false },
    agentDiscovery: { siteUrl: new URL(siteUrl).origin },
    nitro: {
      hooks: {
        'prerender:generate'(route) {
          if (route.contents && /html|xml|text\/|markdown/.test(route.contentType ?? ''))
            route.contents = fixSubfolderUrls(route.contents)
        },
      },
    },
  }),
})
