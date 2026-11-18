<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()
const error = useError()
const pagePath = computed(() => route.path === '/' ? '/' : route.path.replace(/\/+$/, ''))
const indexablePaths = new Set(['/', '/about', '/rules', '/restrictions', '/links', '/cards/search', '/tournaments'])
const publicPage = computed(() => !error.value && (indexablePaths.has(pagePath.value) || pagePath.value === '/cards'))

useHead(() => ({
  link: !error.value && config.public.siteUrl && indexablePaths.has(pagePath.value)
    ? [{ rel: 'canonical', href: `${config.public.siteUrl}${pagePath.value}` }]
    : []
}))

useSeoMeta({
  ogUrl: () => config.public.siteUrl && publicPage.value ? `${config.public.siteUrl}${pagePath.value}` : undefined,
  robots: () => !error.value && pagePath.value === '/cards' ? 'noindex, follow' : undefined
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
