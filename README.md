<div align="center">

<img src="docs/public/favicon.svg" alt="" width="72" height="72">

# Boneprint

**Skeletons measured from your real markup, for Nuxt and Vue.**

[![npm version](https://img.shields.io/npm/v/boneprint?color=00dc82&label=npm)](https://www.npmjs.com/package/boneprint)
[![npm downloads](https://img.shields.io/npm/dm/boneprint?color=00dc82)](https://www.npmjs.com/package/boneprint)
[![License](https://img.shields.io/npm/l/boneprint?color=00dc82)](LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-3%20%26%204-00dc82?logo=nuxt.js&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue-3-00dc82?logo=vue.js&logoColor=white)](https://vuejs.org)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Styling](#styling) • [Documentation](#documentation)

</div>

Wrap a block in `<Skeleton>` and it draws its own loading state from the markup you already have: a bar for every line of text, a block for every image and control. No second, hand-made copy of the layout to keep in sync. The shape is remembered between visits, so the next time the skeleton is the exact size of the content before it arrives.

The approach is inspired by [skullet](https://github.com/lochie/skullet).

## Features

- **Measured, not drawn by hand.** The skeleton is your own template rendered with sample data, laid out by the browser and turned into bones.
- **Remembers the shape.** Geometry is stored per skeleton in `localStorage` and applied on the next visit, before the first paint with server rendering.
- **Understands your data layer.** Pass a `useFetch`, `useAsyncData` or TanStack Query result to `:of` and the loading, empty and error states follow. The slot's `data` is typed.
- **No layout shift.** Margins stay inside the block, borders and dividers keep their real colors, and the box eases to its new height when content arrives.
- **Fast responses show nothing.** A short hold keeps quick requests from flashing a skeleton, and `refresh()` keeps the data on screen.
- **Three reveals.** `fade`, `sequence` or `sweep` when content replaces the skeleton.
- **Plain CSS.** Themed with custom properties, dark mode included, and `prefers-reduced-motion` respected.
- **Debug overlay.** Shows where each shape came from and how far the content moved.

## Installation

```bash
npm install boneprint
```

### Nuxt 3 and Nuxt 4

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['boneprint/nuxt'],
})
```

`<Skeleton>`, `<SkeletonBox>`, `<SkeletonSuspense>` and `forgetSkeletons()` are auto-imported, and the styles are added for you.

### Vue 3 + Vite

Import the component where you use it, there's nothing to set up:

```ts
import { Skeleton } from 'boneprint'
```

Or register it for the whole app, which is also where options go:

```ts
// main.ts
import { boneprint } from 'boneprint'

createApp(App).use(boneprint, { reveal: 'sequence' }).mount('#app')
```

With `unplugin-vue-components`, or `ui()` from `@nuxt/ui/vite`, add the resolver instead:

```ts
// vite.config.ts
import { boneprintResolver } from 'boneprint/resolver'

Components({ resolvers: [boneprintResolver()] })
```

> [!NOTE]
> The styles come with the components, so there's no CSS file to import.

## Usage

```vue
<script setup lang="ts">
const posts = useFetch<Post[]>('/api/posts', { lazy: true, server: false })
const sample: Post[] = [{ id: 1, title: 'A title of about this length' }]
</script>

<template>
  <Skeleton :of="posts" :sample>
    <template #default="{ data }">
      <PostCard v-for="post in data" :key="post.id" :post />
    </template>

    <template #empty>No posts yet</template>

    <template #error="{ error }">{{ error }}</template>
  </Skeleton>
</template>
```

`sample` only draws the first shape. Give it text of typical length, and after the first load the remembered shape takes over.

> [!TIP]
> Without `useFetch` or TanStack Query, set the state by hand with `:data`, `:loading`, `:empty` and `:error`.

### Props

| Prop | Description |
| --- | --- |
| `of` | A `useFetch`, `useAsyncData` or TanStack Query result: anything with `data`, `status` and `error` |
| `data`, `loading`, `empty`, `error` | Set the state by hand, instead of or on top of `of` |
| `sample` | Stands in for `data` while there is none, to draw the shape from |
| `id` | Key for the remembered shape. Defaults to the page plus the order of skeletons on it |
| `label` | Read to screen readers while loading |
| `persist` | Remember the shape between visits. Defaults to the `persist` option |
| `reveal` | How content replaces the skeleton: `fade`, `sequence` or `sweep` |

The `reveal` event fires once content has replaced the skeleton. The `#skeleton` slot and `<SkeletonBox>` draw a skeleton of your own, for what doesn't measure well, like a chart. `<SkeletonSuspense>` is a Suspense boundary with a measured fallback.

> [!IMPORTANT]
> The slot mounts once for the skeleton and again for the content. Keep data fetching and subscriptions outside `<Skeleton>`.

### Options

| Option | Default | Description |
| --- | --- | --- |
| `persist` | `true` | Remember shapes between visits |
| `reveal` | `'fade'` | How content replaces skeletons |
| `debug` | `false` | Turn on the debug overlay |

Set them under `boneprint` in `nuxt.config.ts`, or pass them to `app.use(boneprint, options)` in Vue. On sign-out, call `forgetSkeletons()` to clear what was remembered.

## Styling

Everything is plain CSS, so dark mode works like the rest of your styles:

```css
:root {
  --skeleton-color: rgb(0 0 0 / 0.08);
  --skeleton-radius: 6px;
}

.dark {
  --skeleton-color: rgb(255 255 255 / 0.09);
}
```

| Property | Description |
| --- | --- |
| `--skeleton-color` | Color of the bones |
| `--skeleton-highlight` | Color of the shimmer |
| `--skeleton-radius` | Corner radius of text bars |
| `--skeleton-line-color` | One color for every border and divider, instead of their own |
| `--skeleton-shimmer: none` | Turns the shimmer off |
| `--skeleton-pulse: skeleton-pulse` | Turns pulsing on |
| `--skeleton-hold` | How long a fast response waits before a skeleton shows, `150ms` by default |

`data-skeleton-block` draws an element as one block, and `data-skeleton-skip` leaves it out.

## Debugging

Add `?skeleton-debug` to the URL, set the `debug` option, or put `data-skeleton-debug` around part of the page. Each skeleton is outlined in blue while it loads, then green if nothing moved, or red with how far it did. `data-skeleton-xray` shows the hidden markup through the bones.

## Documentation

The full guide, with live demos, is at **[kukson777.github.io/boneprint](https://kukson777.github.io/boneprint/)**. Its source is in [`docs/`](docs), and it runs locally with:

```bash
pnpm install
pnpm docs:dev
```

## Development

```bash
pnpm dev:prepare  # build stubs and types
pnpm dev          # test fixtures in playground/
pnpm test         # server render tests
pnpm typecheck
```
