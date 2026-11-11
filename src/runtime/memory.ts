import type { Bone, Shape } from './engine'

const KEY = 'boneprint'
const MAX_SHAPES = 50
let epoch = 0

export const memoryEpoch = () => epoch

/** For sign-out. What's on screen now won't be saved back, not even as it unmounts. */
export function forgetSkeletons() {
  epoch++
  try {
    localStorage.removeItem(KEY)
  }
  catch {
    // Blocked storage has nothing to forget
  }
}

// Geometry only: no markup or text, so nothing private is kept and nothing is re-parsed as HTML.
function read(): Record<string, Shape> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  }
  catch {
    return {}
  }
}

export function remember(id: string, element: HTMLElement, measure: (scope: Element, mark: boolean) => Bone[]) {
  const width = element.clientWidth
  if (!width || !element.offsetHeight) return

  // The natural height: the panes follow the root's, which may be mid-animation right now
  element.style.height = 'auto'
  // Fractional on purpose: a rounded height would nudge everything below when the content replaces the skeleton
  const height = element.getBoundingClientRect().height
  element.style.height = ''

  const shapes = read()
  delete shapes[id] // re-inserted last: key order is recency
  shapes[id] = {
    height,
    vw: innerWidth,
    bones: measure(element, false).map(([x, y, w, h, ...rest]) => [x / width, y, w / width, h, ...rest]),
  }
  const stale = Object.keys(shapes).slice(0, -MAX_SHAPES)
  for (const key of stale) delete shapes[key]

  try {
    localStorage.setItem(KEY, JSON.stringify(shapes))
  }
  catch {
    // Storage full or blocked: the next visit just draws from sample
  }
}
