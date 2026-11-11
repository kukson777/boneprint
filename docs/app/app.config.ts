export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      neutral: 'zinc',
    },
    pageHero: {
      slots: {
        title: 'font-semibold sm:text-6xl text-balance',
        description: 'text-pretty',
      },
    },
    pageSection: {
      slots: {
        root: 'border-t border-default bg-linear-to-b from-muted to-default dark:from-muted/40',
      },
    },
    pageCard: {
      slots: {
        footer: 'w-full',
      },
    },
  },
  seo: {
    title: 'Boneprint',
    description: 'Skeletons for Nuxt and Vue, drawn from your real markup: a bar for every line of text, a block for every image. No separate loading template.',
  },
  header: {
    title: 'Boneprint',
  },
  toc: {
    title: 'On this page',
  },
})
