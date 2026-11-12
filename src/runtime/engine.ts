/** A `kind` marks a remembered frame, divider or surface, which has no real element behind it to show through. Its `color` is the element's own. */
export type Bone = [x: number, y: number, width: number, height: number, radius: string, kind?: 'box' | 'line' | 'fill', color?: string]
export type Shape = { height: number, vw: number, bones: Bone[] }
export type SkeletonRoot = HTMLElement & { skeletonLive?: boolean, skeletonShape?: Shape | null }
type Clip = { left: number, right: number, top: number, bottom: number } | null
type Line = { left: number, right: number, top: number, bottom: number, baseline: number, size: number }

/** Also inlined into the boot script, hence the literal key. A shape from another window width would wrap differently. */
export function recall(id: string): Shape | null {
  try {
    const shape = JSON.parse(localStorage.getItem('boneprint') ?? '{}')[id]
    return shape?.vw === innerWidth ? shape : null
  }
  catch {
    return null
  }
}

/**
 * Self-contained on purpose: the inline boot script is this function's source text,
 * so nothing in here may reference anything outside it. `document` is a parameter because
 * the server build replaces the global with `void 0`, which would end up in that text.
 */
export function skeletonEngine(document: Document) {
  const BLOCKS = new Set(['img', 'video', 'canvas', 'svg', 'picture', 'iframe', 'input', 'textarea', 'select'])
  const context = document.createElement('canvas').getContext('2d')!
  const fonts = new Map<string, number[]>()

  // [ascent, descent, cap height, descender ink, x-height, ascender ink], cached: canvas text measuring isn't free
  const metrics = (style: CSSStyleDeclaration) => {
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
    let found = fonts.get(font)
    if (!found) {
      context.font = font
      const box = context.measureText('H')
      found = [
        box.fontBoundingBoxAscent,
        box.fontBoundingBoxDescent,
        box.actualBoundingBoxAscent,
        context.measureText('gjpqy').actualBoundingBoxDescent,
        context.measureText('x').actualBoundingBoxAscent,
        context.measureText('dhl').actualBoundingBoxAscent,
      ]
      fonts.set(font, found)
    }
    return found as [number, number, number, number, number, number]
  }

  // Only an alpha of 0 is transparent, rgb(0, 0, 0) is black. A divider on one side doesn't make a surface.
  const clear = (color: string) => /(^rgba\(.*,|\/) 0\)$/.test(color)
  const painted = (style: CSSStyleDeclaration) =>
    !clear(style.backgroundColor) || style.backgroundImage !== 'none' || !/\b0px/.test(style.borderWidth)
  // A ring is a box-shadow with no offset or blur, which is how Tailwind draws one. Returns its colour.
  const ring = (style: CSSStyleDeclaration) =>
    [...style.boxShadow.matchAll(/(\w+\([^)]*\)) 0px 0px 0px [1-9]/g)].map(match => match[1]!).find(color => !clear(color))

  /** Relative to `scope`. With `mark`, boxes drawn as one block get their own paint hidden. */
  const measure = (scope: Element, mark: boolean): Bone[] => {
    const origin = scope.getBoundingClientRect()
    const range = document.createRange()
    const bones: Bone[] = []
    const lines: Line[] = []

    const cut = (rect: { left: number, right: number, top: number, bottom: number }, clip: Clip) => {
      const box = clip
        ? {
            left: Math.max(rect.left, clip.left),
            right: Math.min(rect.right, clip.right),
            top: Math.max(rect.top, clip.top),
            bottom: Math.min(rect.bottom, clip.bottom),
          }
        : rect
      return box.right - box.left >= 2 && box.bottom - box.top >= 2 ? box : null
    }

    const block = (element: Element, style: CSSStyleDeclaration, clip: Clip) => {
      const box = cut(element.getBoundingClientRect(), clip)
      if (!box) return
      const parent = element.parentElement
      const parentStyle = parent && !parseFloat(style.borderRadius) ? getComputedStyle(parent) : null
      // An avatar is usually a square image inside a round overflow:hidden box
      const radius = parentStyle && parentStyle.overflow !== 'visible' && parent!.offsetWidth === (element as HTMLElement).offsetWidth
        ? parentStyle.borderRadius
        : style.borderRadius
      bones.push([box.left - origin.left, box.top - origin.top, box.right - box.left, box.bottom - box.top, radius])
    }

    // ponytail: top and bottom edges only, which covers cards, rows and separators. Add left and right if a layout needs them.
    const frame = (element: Element, style: CSSStyleDeclaration, clip: Clip) => {
      const rect = element.getBoundingClientRect()
      if (clip && (rect.top >= clip.bottom || rect.bottom <= clip.top || rect.left >= clip.right || rect.right <= clip.left)) return
      const x = rect.left - origin.left
      const y = rect.top - origin.top
      const edge = (width: string, color: string) => parseFloat(width) > 0 && !clear(color)
      const top = edge(style.borderTopWidth, style.borderTopColor)
      const bottom = edge(style.borderBottomWidth, style.borderBottomColor)
      const sides = edge(style.borderLeftWidth, style.borderLeftColor) && edge(style.borderRightWidth, style.borderRightColor)

      // A card's own fill: the ghost shows it on a first visit, so a remembered shape has to as well.
      // Chips never get here, they are blocks. ponytail: the colour only, a gradient or image surface needs data-skeleton-block.
      // Cut like text and blocks: a card scrolled past the edge of a row would be drawn outside the box
      const area = rect.height > 2 && !clear(style.backgroundColor) ? cut(rect, clip) : null
      if (area) bones.push([area.left - origin.left, area.top - origin.top, area.right - area.left, area.bottom - area.top, style.borderRadius, 'fill', style.backgroundColor])

      // The border's own colour, so a divider looks the same before and after loading.
      // ponytail: the computed colour, so one remembered in the dark theme stays dark in the light one until the next save.
      const ringColor = ring(style)
      if ((top && bottom && sides) || ringColor) {
        bones.push([x, y, rect.width, rect.height, style.borderRadius, 'box', top ? style.borderTopColor : ringColor])
        return
      }
      if (top) bones.push([x, y, rect.width, 1, '0', 'line', style.borderTopColor])
      if (bottom) bones.push([x, y + rect.height - 1, rect.width, 1, '0', 'line', style.borderBottomColor])
      // A separator drawn as a thin filled element rather than a border
      if (!top && !bottom && rect.height <= 2 && rect.width > 2 && !clear(style.backgroundColor)) bones.push([x, y, rect.width, rect.height, '0', 'line', style.backgroundColor])
    }

    const text = (node: Text, parent: Element, clip: Clip) => {
      if (!node.data.trim()) return
      const style = getComputedStyle(parent)
      const [ascent, descent, cap, ink, xHeight, tall] = metrics(style)
      const size = parseFloat(style.fontSize)
      const edge = style.getPropertyValue('--skeleton-text-top').trim()
      const above = edge === 'ascender' ? tall : edge === 'x-height' ? xHeight : cap
      const below = style.getPropertyValue('--skeleton-text-bottom').trim() === 'baseline' ? 0 : ink
      range.selectNodeContents(node)
      for (const rect of range.getClientRects()) {
        if (rect.width < 1) continue
        const baseline = rect.top + (rect.height - ascent - descent) / 2 + ascent
        const box = cut({ left: rect.left, right: rect.right, top: baseline - above, bottom: baseline + below }, clip)
        if (box) lines.push({ ...box, baseline, size })
      }
    }

    const walk = (parent: Element, clip: Clip) => {
      for (const node of parent.childNodes) {
        if (node.nodeType === 3) text(node as Text, parent, clip)
        if (node.nodeType !== 1) continue

        const element = node as HTMLElement
        const style = getComputedStyle(element)
        if (style.display === 'none' || element.hasAttribute('data-skeleton-skip')) continue

        const size = parseFloat(style.fontSize)
        // ponytail: "painted and about one line tall" means chip or button. Cheap, unlike counting
        // labels in every card; a taller chip needs data-skeleton-block.
        // Table parts are excluded: striped cells touch, and would read as one gray rectangle.
        // No text needed: an icon button or a status dot is drawn too. Above 2px, so thin separators stay lines.
        const chip = !BLOCKS.has(element.localName) && !/^t(able|head|body|foot|r|d|h)$/.test(element.localName) && painted(style) && element.offsetHeight > 2 && element.offsetHeight <= size * 3.2
        // A CSS icon (iconify, Nuxt UI): currentColor through a mask, and the ghost's text colour is transparent
        const icon = [style.maskImage, style.webkitMaskImage].some(mask => mask && mask !== 'none')
        if (BLOCKS.has(element.localName) || icon || chip || element.hasAttribute('data-skeleton-block')) {
          block(element, style, clip)
          // Only when missing: the skeleton repaints on mutations, and a repeat write would loop
          if (mark && chip && !element.hasAttribute('data-skeleton-covered')) element.setAttribute('data-skeleton-covered', '')
          continue
        }

        // Only when remembering: a live skeleton has the real frames in its ghost
        if (!mark) frame(element, style, clip)

        const clips = style.overflowX !== 'visible' || style.overflowY !== 'visible'
        if (!clips) {
          walk(element, clip)
          continue
        }
        // Nothing left inside: a 1px .sr-only box, or one scrolled out of its parent. What's in it isn't seen.
        const inner = cut(element.getBoundingClientRect(), clip)
        if (inner) walk(element, inner)
      }
    }
    walk(scope, null)

    // Runs of one line share a baseline. A row is every baseline within 2px of its first, put in order
    // left to right before merging: sorted by baseline alone, a column a pixel higher came first and swallowed its left neighbour
    lines.sort((a, b) => a.baseline - b.baseline)
    const bars: Line[] = []
    for (let start = 0, end = 0; start < lines.length; start = end) {
      while (end < lines.length && lines[end]!.baseline - lines[start]!.baseline < 2) end++
      let last: Line | undefined
      for (const line of lines.slice(start, end).sort((a, b) => a.left - b.left)) {
        if (last && line.left - last.right <= Math.max(last.size, line.size) * 0.4) {
          last.right = Math.max(last.right, line.right)
          last.top = Math.min(last.top, line.top)
          last.bottom = Math.max(last.bottom, line.bottom)
        }
        else {
          bars.push(last = line)
        }
      }
    }
    for (const { left, right, top, bottom, size } of bars) {
      const height = bottom - top
      // One character, a "1" in a rank column, would be a sliver: at least 1em, grown about its middle
      const grow = Math.max(0, size - (right - left)) / 2
      bones.push([left - grow - origin.left, top - origin.top, right - left + grow * 2, height, `var(--skeleton-radius, ${Math.round(height / 3)}px)`])
    }
    return bones
  }

  const draw = (layer: HTMLElement, bones: Bone[]) => {
    // The sweep starts from the left when the skeleton appears; a repaint picks it up where it is instead of restarting
    if (!layer.dataset.start) layer.dataset.start = String(performance.now())
    const phase = Math.round((performance.now() - Number(layer.dataset.start)) % 1800)
    if (!layer.style.animationDelay) layer.style.animationDelay = `-${phase}ms`
    layer.replaceChildren(...bones.map(([x, y, width, height, radius, kind, color]) => {
      const bone = document.createElement('i')
      if (kind) bone.dataset.line = kind
      bone.style.cssText = `left:${x}px;top:${y}px;width:${width}px;height:${height}px;--x:${x}px;--p:${phase}ms`
      if (color) bone.style.setProperty('--skeleton-own-color', color)
      bone.style.borderRadius = radius
      return bone
    }))
  }

  const bonesOf = (root: SkeletonRoot): Bone[] => {
    if (!root.skeletonShape) return measure(root.firstElementChild!, true)
    const width = root.clientWidth
    return root.skeletonShape.bones.map(([x, y, w, h, ...rest]) => [x * width, y, w * width, h, ...rest])
  }

  /** All reads first, then all writes, so skeletons never force layout on each other. */
  const paint = (...roots: SkeletonRoot[]) => {
    const planned = roots.map(bonesOf)
    roots.forEach((root, i) => draw(root.lastElementChild as HTMLElement, planned[i]!))
  }

  return { measure, paint }
}

function boot({ paint }: ReturnType<typeof skeletonEngine>, document: Document, recall: (id: string) => Shape | null) {
  const roots = new Set<SkeletonRoot>()
  const scan = () => document.querySelectorAll<SkeletonRoot>('[data-skeleton]').forEach((root) => {
    const ghost = root.firstElementChild as HTMLElement | null
    if (!ghost || roots.has(root)) return
    roots.add(root)
    root.skeletonShape = recall(root.dataset.skeletonId ?? '')
    // On the ghost, not the root: the root has a style binding that hydration would flag as changed
    if (root.skeletonShape) ghost.style.cssText = `height:${root.skeletonShape.height}px;overflow:hidden;visibility:hidden`
    // Fires after layout and before paint, so the first paint already has its bones
    const observer = new ResizeObserver(() => root.skeletonLive ? observer.disconnect() : paint(root))
    observer.observe(root)
  })
  const parsing = new MutationObserver(scan)
  parsing.observe(document.documentElement, { childList: true, subtree: true })
  addEventListener('DOMContentLoaded', () => {
    scan()
    parsing.disconnect()
  })
  document.fonts.ready.then(() => paint(...[...roots].filter(root => !root.skeletonLive && root.isConnected)))
}

/** One script in <head> for the page, so components render no <script> tags of their own. */
export const bootScript = () => `(${boot})((${skeletonEngine})(document),document,${recall})`.replace(/^\s+/gm, '')
