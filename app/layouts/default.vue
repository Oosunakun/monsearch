<script setup lang="ts">
import type { NavItem } from '~~/app/types/ui/layout'
import AppHeader from '~~/app/components/layout/AppHeader.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'
import { useDisplay } from 'vuetify'
import { LAYOUT_SIDEBAR, LAYOUT_HEADER} from '~~/app/types/ui/layout'
import AppNavigationDrawer from '~~/app/components/layout/AppNavigationDrawer.vue'

const { mdAndUp, mobile } = useDisplay()

// PC(md以上)なら表示、モバイルなら非表示で開始
const drawer = ref(mdAndUp.value)
const rail = ref(false)

const navItems: NavItem[] = [
  { label: 'カードセット', to: '/', icon: 'mdi-view-list' },
  { label: '詳細検索', to: '/cards/search', icon: 'mdi-magnify' },
  { label: '使用制限', to: '/restrictions', icon: 'mdi-alert-octagon' },
  { label: 'ルール', to: '/rules', icon: 'mdi-book-open-variant' },
  { label: 'リンク', to: '/links', icon: 'mdi-link-variant' },
  { label: 'About', to: '/about', icon: 'mdi-information' }
]

const { quickSearchState, cardPools, searchTypes, runQuickSearch } = useQuickSearch()

// 画面サイズ変更時の追従（任意：PCサイズに戻った時に自動で出す）
watch(mdAndUp, (isDesktop) => {
  drawer.value = isDesktop
})
</script>

<template>
<v-app
  :style="{ 
    '--sidebar-width': `${LAYOUT_SIDEBAR.WIDTH}px`, 
    '--rail-width': `${LAYOUT_SIDEBAR.RAIL_WIDTH}px`,
    '--header-height': `${LAYOUT_HEADER.HEIGHT}px`
  }">
    <NuxtLoadingIndicator :color="UI_COLORS.PRIMARY" :height="2" />

    <AppNavigationDrawer
      v-model:drawer="drawer"
      v-model:rail="rail"
      v-model:quick-search-state="quickSearchState"
      :is-mobile="mobile"
      :nav-items="navItems"
      :search-types="searchTypes"
      @submit="runQuickSearch"
    />

    <AppHeader
      v-model:drawer="drawer"
      v-model:quick-search-state="quickSearchState"
      :is-mobile="mobile"
      :nav-items="navItems"
      :card-pools="cardPools"
      :search-types="searchTypes"
      :class="{ 
        'header-is-rail': !mobile && rail, 
        'header-is-expanded': !mobile && !rail,
        'header-full-width': mobile
      }"
      @submit-quick-search="runQuickSearch"
    />

    <v-main class="bg-background" d-flex flex-column style="min-height: 100vh;">
      <v-container fluid class="pa-4">
        <slot></slot>
      </v-container>
    </v-main>
  </v-app>
</template>
<style scoped>
/* SkeletonLoaderで隠せない・かつJS前に必要な要素はv-bindを用いずハードコードとします */
:deep(.v-main) {
  /* LAYOUT_HEADER.HEIGHTの値が将来変わる場合は、この1行も合わせて変更する必要があります */
  padding-top: 48px !important;
}

@media (min-width: 960px) {
  /* 初期レンダリング時のガタつきを抑えるための先行スタイル */
  :deep(.v-navigation-drawer.is-expanded) {
    width: v-bind('`${LAYOUT_SIDEBAR.WIDTH}px`') !important;
  }
  :deep(.v-navigation-drawer.is-rail) {
    width: v-bind('`${LAYOUT_SIDEBAR.RAIL_WIDTH}px`') !important;
  }

  /* アプリバーの初期位置をドロワー幅に合わせる */
  /* これにより、JS起動前でもアプリバーが正しい位置に配置されます */
  :deep(.v-app-bar.header-is-expanded) {
    left: v-bind('`${LAYOUT_SIDEBAR.WIDTH}px`') !important;
    width: calc(100% - v-bind('`${LAYOUT_SIDEBAR.WIDTH}px`')) !important;
  }
  :deep(.v-app-bar.header-is-rail) {
    left: v-bind('`${LAYOUT_SIDEBAR.RAIL_WIDTH}px`') !important;
    width: calc(100% - v-bind('`${LAYOUT_SIDEBAR.RAIL_WIDTH}px`')) !important;
  }

  /* 共通：高さの固定 */
  :deep(.v-app-bar) {
    height: v-bind('`${LAYOUT_HEADER.HEIGHT}px`') !important;
  }

  /* フッターもヘッダー同様に左余白を先行適用 */
  :deep(.v-footer.footer-is-expanded) {
    left: v-bind('`${LAYOUT_SIDEBAR.WIDTH}px`') !important;
    width: calc(100% - v-bind('`${LAYOUT_SIDEBAR.WIDTH}px`')) !important;
  }
  :deep(.v-footer.footer-is-rail) {
    left: v-bind('`${LAYOUT_SIDEBAR.RAIL_WIDTH}px`') !important;
    width: calc(100% - v-bind('`${LAYOUT_SIDEBAR.RAIL_WIDTH}px`')) !important;
  }
}

/* モバイル時はヘッダーを横いっぱいに広げる */
@media (max-width: 959px) {
  :deep(.v-app-bar) {
    left: 0 !important;
    width: 100% !important;
  }
}
</style>