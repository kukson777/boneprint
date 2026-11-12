<script setup lang="ts">
type Post = { id: number, title: string, body: string }

const sample: Post[] = [
  { id: 1, title: 'A sample post title', body: 'A sample post body, long enough to wrap onto a second line in a narrow column.' },
  { id: 2, title: 'Second sample', body: 'Shorter.' },
]

const first = useFetch<Post[]>('/api/posts?slow=1', { server: false, lazy: true })
const second = useFetch<Post[]>('/api/posts?slow=2', { server: false, lazy: true })
const ready = await useFetch<Post[]>('/api/posts')
const empty = await useFetch<Post[]>('/api/empty')
const failed = await useFetch<Post[]>('/api/fail')

// Has no sample on purpose, so a repeat load can only draw from the remembered shape
const remembered = ref<Post[] | null>(ready.data.value ?? null)
const reloadRemembered = () => {
  remembered.value = null
  setTimeout(() => remembered.value = ready.data.value ?? null, 1500)
}

const flipData = ref<string[] | null>(['Content'])
const flipError = ref<string | undefined>()
const flipContent = () => {
  flipData.value = null
  setTimeout(() => flipData.value = ['Content'], 20)
}
const flipFailure = () => {
  flipError.value = undefined
  setTimeout(() => flipError.value = 'Server is down', 30)
}

const signedIn = ref(true)
const signOut = () => {
  forgetSkeletons()
  signedIn.value = false
}

// The data layer's placeholder list while loading, both by hand and from useFetch
const placeholder = useFetch<Post[]>('/api/posts?slow=3', { server: false, lazy: true, default: () => [] })

// Saved with its fill, then loading again with an empty list: drawn from memory
const surfaceData = ref<string[]>(['Card'])
const surfaceLoading = ref(false)
const reloadSurface = () => {
  surfaceData.value = []
  surfaceLoading.value = true
}

// A CSS icon the way iconify draws one: currentColor through a mask, which the ghost makes transparent
const maskIcon = 'display: inline-block; width: 20px; height: 20px; background-color: currentColor; mask-image: linear-gradient(#000, #000)'

// Over a pixel higher than its neighbour, so it sorts first even though it's further right
const higherColumn = 'font-size: 11px; position: relative; top: -1.2px'
</script>

<template>
  <main style="max-width: 24rem; margin: 2rem auto; font-family: system-ui">
    <section id="remembered">
      <Skeleton id="remembered" :data="remembered" v-slot="{ data }">
        <p v-for="post in data" :key="post.id">{{ post.title }}</p>
      </Skeleton>

      <button id="reload" @click="reloadRemembered">Reload</button>
    </section>

    <section id="first">
      <Skeleton :of="first" :sample v-slot="{ data }">
        <article v-for="post in data" :key="post.id">
          <h2>{{ post.title }}</h2>

          <p>{{ post.body }}</p>
        </article>
      </Skeleton>
    </section>

    <section id="second">
      <Skeleton :of="second" :sample v-slot="{ data }">
        <p v-for="post in data" :key="post.id">{{ post.title }}</p>
      </Skeleton>
    </section>

    <section id="ready">
      <Skeleton :of="ready" :sample v-slot="{ data }">
        <p v-for="post in data" :key="post.id">{{ post.title }}</p>
      </Skeleton>
    </section>

    <section id="empty">
      <Skeleton :of="empty" :sample>
        <template #default="{ data }">
          <p v-for="post in data" :key="post.id">{{ post.title }}</p>
        </template>

        <template #empty>
          <p>No posts</p>
        </template>
      </Skeleton>
    </section>

    <section id="failed">
      <Skeleton :of="failed" :sample>
        <template #default="{ data }">
          <p v-for="post in data" :key="post.id">{{ post.title }}</p>
        </template>

        <template #error>
          <p>Failed to load</p>
        </template>
      </Skeleton>
    </section>

    <section id="shapes">
      <Skeleton :loading="true">
        <table>
          <tbody>
            <tr>
              <td style="background: #eee">Cell</td>

              <th style="background: #ddd">Header</th>
            </tr>
          </tbody>
        </table>

        <ul>
          <li style="border-top: 1px solid #ccc">Row with a divider</li>
        </ul>

        <span id="flat" style="display: flex; height: 40px; box-shadow: 0 0 #0000">Clear shadow</span>

        <span id="chip" style="background: #000; color: #fff; border-radius: 999px; padding: 2px 8px">Black chip</span>
      </Skeleton>
    </section>

    <section id="flip">
      <Skeleton :data="flipData" :error="flipError" :sample="['Sample']">
        <template #default="{ data }">
          <p id="flip-content">{{ data[0] }}</p>
        </template>

        <template #error>
          <p id="flip-failed">Failed</p>
        </template>
      </Skeleton>

      <button id="flip-content-run" @click="flipContent">Content off and on</button>

      <button id="flip-error-on" @click="flipError = 'Server is down'">Error</button>

      <button id="flip-error-run" @click="flipFailure">Retry with an error</button>
    </section>

    <section id="full" style="height: 160px; display: flex; flex-direction: column">
      <Skeleton :loading="true" style="flex: 1; min-height: 0">
        <div id="scroller" style="height: 100%; overflow: auto">
          <p v-for="n in 20" :key="n">Line {{ n }}</p>
        </div>
      </Skeleton>
    </section>

    <section id="account">
      <Skeleton v-if="signedIn" id="account-shape" :data="['Profile']" v-slot="{ data }">
        <p>{{ data[0] }}</p>
      </Skeleton>

      <button id="sign-out" @click="signOut">Sign out</button>
    </section>

    <section id="private">
      <Skeleton id="private-shape" :persist="false" :data="['Not remembered']" v-slot="{ data }">
        <p>{{ data[0] }}</p>
      </Skeleton>
    </section>

    <section id="waiting">
      <Skeleton :data="[] as Post[]" :loading="true" :sample v-slot="{ data }">
        <p v-for="post in data" :key="post.id">{{ post.title }}</p>
      </Skeleton>
    </section>

    <section id="placeholder">
      <Skeleton :of="placeholder" :sample v-slot="{ data }">
        <p v-for="post in data" :key="post.id">{{ post.title }}</p>
      </Skeleton>
    </section>

    <section id="ghost-flag">
      <Skeleton :loading="true">
        <GhostProbe />
      </Skeleton>
    </section>

    <section id="live-flag">
      <Skeleton :data="['Content']">
        <GhostProbe />
      </Skeleton>
    </section>

    <section id="screen-reader">
      <Skeleton :loading="true">
        <p>Rating</p>

        <span style="position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap">Read to screen readers only</span>
      </Skeleton>
    </section>

    <section id="icon">
      <Skeleton :loading="true">
        <span :style="maskIcon" />
      </Skeleton>
    </section>

    <section id="columns">
      <Skeleton :loading="true">
        <div style="display: flex; align-items: baseline; justify-content: space-between">
          <span style="font-size: 12px">Emerald · 10 first</span>

          <span :style="higherColumn">Exp</span>
        </div>
      </Skeleton>
    </section>

    <section id="surface">
      <Skeleton id="surface-shape" :data="surfaceData" :loading="surfaceLoading">
        <div style="background: rgb(10, 20, 30); color: #fff; padding: 16px; border-radius: 8px">
          <p>A card on its own surface</p>
        </div>
      </Skeleton>

      <button id="surface-reload" @click="reloadSurface">Reload</button>
    </section>
  </main>
</template>
