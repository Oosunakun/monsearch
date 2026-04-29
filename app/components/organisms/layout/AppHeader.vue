<script setup lang="ts">
import type { QuickSearchOption, QuickSearchState } from '~~/app/types/ui/layout'
import QuickSearchBar from '~~/app/components/molecules/search/QuickSearchBar.vue'
import SearchMagnifyButton from '~~/app/components/molecules/search/SearchMagnifyButton.vue'
import HeaderTitle from '~~/app/components/molecules/layout/HeaderTitle.vue'

const { drawer, isMobile, quickSearchState, cardPools, searchTypes } = defineProps<{
  drawer: boolean
  isMobile: boolean
  quickSearchState: QuickSearchState
  cardPools: QuickSearchOption[]
  searchTypes: QuickSearchOption[]
}>()

const emit = defineEmits<{
  'update:drawer': [value: boolean]
  'update:quickSearchState': [value: QuickSearchState]
  navigate: [path: string]
  submitQuickSearch: []
}>()
</script>

<template>
  <v-app-bar border="b" elevation="0" density="compact">
    
    <!-- モバイル: ハンバーガー（左固定） -->
    <v-app-bar-nav-icon
      v-if="isMobile"
      class="flex-shrink-0"
      @click="$emit('update:drawer', !drawer)"
    />

    <!-- タイトル -->
    <HeaderTitle 
      :is-mobile = "isMobile"
    />

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
</style>
