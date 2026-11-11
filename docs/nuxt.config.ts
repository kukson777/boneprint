export default defineNuxtConfig({
  extends: ['docus'],
  modules: ['../src/module', 'nuxt-image-viewer'],
  site: {
    name: 'Boneprint',
    url: process.env.NUXT_SITE_URL || 'http://localhost:3000',
  },
  compatibilityDate: '2026-11-01',
  // Node 24 has sqlite built in, so no native package to compile
  content: { experimental: { sqliteConnector: 'native' } },
  // Above the sticky header of the site
  imageViewer: { zIndex: 100 },
  // Crawlers only read robots.txt at the root of a domain, and GitHub Pages serves the site from /boneprint/
  robots: { robotsTxt: false },
})
