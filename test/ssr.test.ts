import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

const count = (text: string, part: string) => text.split(part).length - 1
const section = (html: string, id: string) => html.split(`<section id="${id}">`)[1]!.split('</section>')[0]!

describe('server render', async () => {
  await setup({ rootDir: fileURLToPath(new URL('../playground', import.meta.url)) })
  let html = ''
  beforeAll(async () => {
    html = await $fetch<string>('/')
  })

  it('sends one boot script in <head> and none inside the skeletons', () => {
    expect(count(html, 'new MutationObserver')).toBe(1)
    expect(html.indexOf('new MutationObserver')).toBeLessThan(html.indexOf('</head>'))
    expect(section(html, 'first')).not.toContain('<script')
  })

  it('keeps document in the boot script, which the server build would replace', () => {
    expect(html).not.toContain('(void 0)')
  })

  it('gives the boot script what it needs to apply a remembered shape', () => {
    expect(html).toMatch(/localStorage\.getItem\(["']boneprint["']\)/)
    expect(section(html, 'first')).toContain('data-skeleton-id="/#')
  })

  it('puts the request nonce on the boot script', async () => {
    const withNonce = await $fetch<string>('/?nonce=1')
    expect(withNonce).toMatch(/<script[^>]*nonce="test-nonce"[^>]*>[^<]*new MutationObserver/)
    expect(html).not.toContain('test-nonce')
  })

  it('has the stylesheet in <head>, so it blocks first paint', async () => {
    const head = html.split('</head>')[0]!
    const inline = /\[data-skeleton-layer\]\s*\{/.test(head)
    const links = [...head.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(match => match[1]!)
    const linked = await Promise.all(links.map(href => $fetch<string>(href, { responseType: 'text' })))
    expect(inline || linked.some(css => /\[data-skeleton-layer\]\s*\{/.test(css))).toBe(true)
  })

  it('maps useFetch states', () => {
    expect(section(html, 'first')).toContain('data-skeleton-ghost')
    expect(section(html, 'first')).toContain('A sample post title')
    // Inside <template> the skeleton would be inert until hydration
    expect(section(html, 'first')).not.toContain('<template')
    expect(section(html, 'ready')).toContain('Second real post')
    expect(section(html, 'ready')).not.toContain('data-skeleton-ghost')
    expect(section(html, 'empty')).toContain('No posts')
    expect(section(html, 'failed')).toContain('Failed to load')
  })
})
