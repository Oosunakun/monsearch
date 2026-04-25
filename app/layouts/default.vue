<script setup lang="ts">
import type { NavItem } from '~~/app/types/ui/layout'
import AppFooter from '~~/app/components/organisms/layout/AppFooter.vue'
import AppHeader from '~~/app/components/organisms/layout/AppHeader.vue'
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'

const router = useRouter()
const drawer = ref(false)

const navItems: NavItem[] = [
  { label: 'カードリスト', to: '/cards' },
  { label: '詳細検索', to: '/cards/search' },
  { label: '使用制限', to: '/restrictions' },
  { label: 'ルール', to: '/rules' },
  { label: '大会情報', to: '/tournaments' },
  { label: 'About', to: '/about' }
]

const { quickSearchState, cardPools, searchTypes, runQuickSearch } = useQuickSearch()

const moveTo = async (path: string) => {
  await router.push(path)
}
</script>

<template>
  <v-app>
    <AppHeader
      :drawer="drawer"
      :nav-items="navItems"
      :quick-search-state="quickSearchState"
      :card-pools="cardPools"
      :search-types="searchTypes"
      @update:drawer="drawer = $event"
      @update:quick-search-state="quickSearchState = $event"
      @navigate="moveTo"
      @submit-quick-search="runQuickSearch"
    />

    <v-main class="bg-background">
      <ContentMaxWidthContainer class="py-5">
        <slot />
      </ContentMaxWidthContainer>
    </v-main>

    <AppFooter />
  </v-app>
</template>