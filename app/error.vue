<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const status = computed(() => props.error.statusCode || 500)
const heading = computed(() => status.value === 404 ? 'ページが見つかりません' : 'エラーが発生しました')

useHead({ htmlAttrs: { lang: 'ja' } })
useSeoMeta({
  title: () => `モンさーち！｜${status.value} ${heading.value}`,
  robots: 'noindex, follow'
})

const goHome = () => clearError({ redirect: '/' })
</script>

<template>
  <main class="error-page">
    <p class="error-status">{{ status }}</p>
    <h1>{{ heading }}</h1>
    <a href="/" @click.prevent="goHome">トップページへ戻る</a>
  </main>
</template>

<style scoped>
.error-page {
  position: fixed;
  inset: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 2rem;
  background: #F5F5F5;
  color: #333333;
  text-align: center;
}

.error-status {
  margin: 0;
  font-size: 3rem;
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
}

a {
  color: inherit;
  text-underline-offset: 0.2em;
}
</style>
