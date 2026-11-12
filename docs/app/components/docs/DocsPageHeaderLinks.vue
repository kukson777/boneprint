<script setup lang="ts">
// Docus's own menu without the MCP items: GitHub Pages is a static host, so there is no MCP server to add
import { useClipboard } from '@vueuse/core'
import { joinURL } from 'ufo'

const route = useRoute()
const appBaseURL = useRuntimeConfig().app.baseURL || '/'
const { copy, copied } = useClipboard()
const { t } = useDocusI18n()

// With the base: the site lives in /boneprint/ on GitHub Pages
const rawPath = computed(() => joinURL(appBaseURL, `${joinURL('/raw', route.path)}.md`))
const markdownLink = computed(() => `${window?.location?.origin}${rawPath.value}`)
const ask = (link: string) => encodeURIComponent(`Read ${link} so I can ask questions about it.`)

const items = computed(() => [
  { label: t('docs.copy.link'), icon: 'i-lucide-link', onSelect: () => copy(markdownLink.value) },
  { label: t('docs.copy.view'), icon: 'i-simple-icons:markdown', target: '_blank', to: markdownLink.value },
  { label: t('docs.copy.gpt'), icon: 'i-simple-icons:openai', target: '_blank', to: `https://chatgpt.com/?hints=search&q=${ask(markdownLink.value)}` },
  { label: t('docs.copy.claude'), icon: 'i-simple-icons:anthropic', target: '_blank', to: `https://claude.ai/new?q=${ask(markdownLink.value)}` },
])

async function copyPage() {
  copy(await $fetch<string>(rawPath.value))
}
</script>

<template>
  <UFieldGroup size="sm">
    <UButton
      :label="t('docs.copy.page')"
      :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
      color="neutral"
      variant="soft"
      :ui="{ leadingIcon: 'text-neutral size-3.5' }"
      @click="copyPage"
    />

    <UDropdownMenu size="sm" :items :content="{ align: 'end', side: 'bottom', sideOffset: 8 }">
      <UButton
        icon="i-lucide-chevron-down"
        color="neutral"
        variant="soft"
        :aria-label="t('docs.copy.more')"
        class="border-l border-muted"
      />
    </UDropdownMenu>
  </UFieldGroup>
</template>
