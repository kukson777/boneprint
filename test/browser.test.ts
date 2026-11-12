import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { createPage, setup } from '@nuxt/test-utils/e2e'

// Layout only exists in a browser. The installed Chrome, so nothing to download.
describe('in the browser', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('../playground', import.meta.url)),
    browser: true,
    browserOptions: { type: 'chromium', launch: { channel: 'chrome' } },
  })

  it('leaves out text that is only read to screen readers', async () => {
    const page = await createPage('/')
    const bones = page.locator('#screen-reader [data-skeleton-layer] i')
    await expect.poll(() => bones.count()).toBeGreaterThan(0)
    // One bar for "Rating", none for the 1px clipped span
    expect(await bones.count()).toBe(1)
    await page.close()
  })

  it('draws an icon painted through a mask', async () => {
    const page = await createPage('/')
    await expect.poll(() => page.locator('#icon [data-skeleton-layer] i').count()).toBe(1)
    await page.close()
  })

  it('keeps text of neighbouring columns apart when their baselines differ a little', async () => {
    const page = await createPage('/')
    const bones = page.locator('#columns [data-skeleton-layer] i')
    await expect.poll(() => bones.count()).toBeGreaterThan(0)
    const lefts = await bones.evaluateAll(all => all.map(bone => bone.getBoundingClientRect().left))
    expect(lefts).toHaveLength(2)
    // The left caption keeps its own bar at the left edge
    expect(Math.min(...lefts)).toBeLessThan(await page.locator('#columns').evaluate(root => root.getBoundingClientRect().left + 20))
    await page.close()
  })

  it('remembers a surface in its own colour and draws it while loading an empty list', async () => {
    const page = await createPage('/')
    const saved = () => page.evaluate(() => JSON.parse(localStorage.getItem('boneprint') ?? '{}')['surface-shape']?.bones ?? [])
    await expect.poll(saved).toContainEqual(expect.arrayContaining(['fill', 'rgb(10, 20, 30)']))

    await page.click('#surface-reload')
    const fill = page.locator('#surface [data-skeleton-layer] i[data-line="fill"]')
    await expect.poll(() => fill.count()).toBe(1)
    expect(await fill.evaluate(bone => getComputedStyle(bone).backgroundColor)).toBe('rgb(10, 20, 30)')
    // Bars for the text are drawn after the surface, so on top of it
    expect(await page.locator('#surface [data-skeleton-layer] i:not([data-line]) ').count()).toBeGreaterThan(0)
    await page.close()
  })
})
