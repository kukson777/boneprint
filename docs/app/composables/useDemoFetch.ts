function withControls<R extends { status: Ref<string>, clear: () => void, execute: () => Promise<void> }>(result: R) {
  const loading = computed(() => !['success', 'error'].includes(result.status.value))

  // clear() empties the data, the only way back to a skeleton: a plain refresh keeps the old data on screen
  const reload = () => {
    result.clear()
    result.execute()
  }

  return Object.assign(result, { loading, reload })
}

/** A real DummyJSON request. `delay` is the API's own parameter: the response really arrives that much later. */
export function useDemoFetch<T>(path: MaybeRefOrGetter<string>, delay: number) {
  const url = () => {
    const current = toValue(path)
    return `https://dummyjson.com/${current}${current.includes('?') ? '&' : '?'}delay=${delay}`
  }

  // watch: false, so a changed path goes through reload() and shows the skeleton instead of swapping data in place
  return withControls(useFetch<T>(url, { lazy: true, server: false, watch: false }))
}

/** For screens that join several requests into one. */
export function useDemoData<T>(key: string, load: () => Promise<T>) {
  return withControls(useAsyncData<T>(key, load, { lazy: true, server: false }))
}
