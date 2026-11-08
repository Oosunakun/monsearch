<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

useSeoMeta({
  ogUrl: () => config.public.siteUrl ? `${config.public.siteUrl}${route.path}` : undefined
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
