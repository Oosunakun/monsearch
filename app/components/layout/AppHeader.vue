<script setup lang="ts">
import type { QuickSearchOption, QuickSearchState, QuickSearchTarget } from '~~/app/types/ui/layout'
import QuickSearchBar from '~~/app/components/layout/QuickSearchBar.vue'
import SearchMagnifyButton from '~~/app/components/layout/SearchMagnifyButton.vue'
import HeaderTitle from '~~/app/components/layout/HeaderTitle.vue'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'

const { drawer, isMobile, quickSearchState, cardPools, searchTypes } = defineProps<{
  drawer: boolean
  isMobile: boolean
  quickSearchState: QuickSearchState
  cardPools: QuickSearchOption[]
  searchTypes: QuickSearchOption<QuickSearchTarget>[]
}>()

const emit = defineEmits<{
  'update:drawer': [value: boolean]
  'update:quickSearchState': [value: QuickSearchState]
  navigate: [path: string]
  submitQuickSearch: []
}>()

const { isMounted } = useHydrated()
</script>

<template>
  <v-app-bar border="b" elevation="0" density="compact">
      <!-- ハンバーガーアイコンの SkeletonLoader -->
      <template v-if="!isMounted">
        <div class="d-flex">
          <v-skeleton-loader type="avatar" class="pa-0 skeleton-avatar-compact" />
        </div>
      </template>
      <template v-else>
        <v-app-bar-nav-icon
          v-if="isMobile"
          class="flex-shrink-0"
          @click="$emit('update:drawer', !drawer)"
        />
      </template>

      <!-- タイトル -->
      <HeaderTitle 
        :is-mobile = "isMobile"
      />

      <!-- 検索エリアの SkeletonLoader -->
      <template v-if="!isMounted">
        <v-spacer />
        <div class="skeleton-search-pc d-none d-md-flex">
          <SkeletonLoader
            preset="app-bar"
            :loading="true"
            class="w-100"
          />
        </div>
        <div class="skeleton-search-mobile d-flex d-md-none">
          <v-skeleton-loader type="avatar" class="pa-0 skeleton-avatar-compact" />
        </div>
      </template>
      <template v-else>
        <!-- PC: 検索エリア（右寄せ・幅上限あり） -->
        <template v-if="!isMobile">
          <v-spacer />
          <div class="pc-search-zone">
            <QuickSearchBar
              :model-value="quickSearchState"
              :card-pools="cardPools"
              :search-types="searchTypes"
              @update:model-value="emit('update:quickSearchState', $event)"
              @submit="emit('submitQuickSearch')"
            />
          </div>
        </template>
        <!-- モバイル: 虫眼鏡（右固定） -->
        <template v-else>
          <v-spacer />
          <SearchMagnifyButton />
        </template>
      </template>
  </v-app-bar>
</template>
<style scoped>
.v-app-bar {
  user-select: none;
}

/* v-app-bar内部のflexコンテナを上書きして3ゾーン構造を作る */
:deep(.v-app-bar__content) {
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow: visible;
}

.pc-search-zone {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;            /* 固定幅・spacerに押されて右端へ */
  width: clamp(360px, 40vw, 560px); /* 画面幅に応じて伸縮 */
  min-width: 0;
  padding-right: 15px;
}

/* PC検索窓スケルトンのラッパー（実物とサイズを完全一致させる） */
.skeleton-search-pc {
  width: clamp(360px, 40vw, 560px);
  padding-right: 15px;
  align-items: center;
  justify-content: flex-end;
}

/* モバイル虫眼鏡ボタンスケルトンのラッパー */
.skeleton-search-mobile {
  width: 48px;
  height: 48px;
  align-items: center;
  justify-content: center;
  padding-right: 8px;
}

/* Vuetifyの丸型スケルトン(avatar)を、通常のボタンサイズ(32px)に縮小調整 */
:deep(.skeleton-avatar-compact .v-skeleton-loader__avatar) {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
}
</style>
