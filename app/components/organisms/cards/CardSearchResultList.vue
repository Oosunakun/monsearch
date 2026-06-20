<script setup lang="ts">
import { useDisplay } from 'vuetify'
import type { Card } from '~~/types/cards/finder_cards'
import CardSearchResultDisplaySettings from '~~/app/components/organisms/cards/CardSearchResultDisplaySettings.vue'
import CardSearchResultItem from '~~/app/components/organisms/cards/results/CardSearchResultItem.vue'
import { LAYOUT_HEADER } from '~~/app/types/ui/layout'

const { mobile } = useDisplay()
const rootRef = ref<HTMLElement>()

const props = defineProps<{
  cards: Card[]
  totalCount: number
}>()

const currentPage = defineModel<number>('currentPage', { required: true })
const totalPages = defineModel<number>('totalPages', { required: true })

// 💡 親コンポーネントで定義している並び順と件数のステートと同期を取るため、defineModel化しておくと安全です
const sortItem = defineModel<string>('sortItem',{ default: 'id' })
const sortOrder = defineModel<string>('sortOrder',{ default: 'asc' })
const limitPerPage = defineModel<number>('limitPerPage',{ default: 20 })

const SCROLL_MARGIN = 10
defineExpose({
  scrollToTop() {
    if (!rootRef.value) return
    const y =
      rootRef.value.getBoundingClientRect().top +
      window.scrollY -
      LAYOUT_HEADER.HEIGHT -
      SCROLL_MARGIN

    window.scrollTo({
      top: Math.max(0, y),
      behavior: 'smooth',
    })
  },
})

// ダミー用選択肢（必要に応じてProps化してください）
// 表示設定用のマスタ定義
const sortOptions = [
  { title: 'ID順', value: 'id' },
  { title: 'レアリティ順', value: 'rarity' },
  { title: '攻撃力順', value: 'atk' },
]
const sortOrders = [
  { title: '昇順', value: 'asc', icon: 'mdi-sort-ascending' },
  { title: '降順', value: 'desc', icon: 'mdi-sort-descending' },
]
const limitOptions = [
  { title: '20件', value: 20 },
  { title: '50件', value: 50 },
  { title: '100件', value: 100 },
]

const fromIndex = computed(() => {
  if (props.totalCount === 0) return 0

  return (currentPage.value - 1) * limitPerPage.value + 1
})
const toIndex = computed(() =>
  Math.min(
    currentPage.value * limitPerPage.value,
    props.totalCount
  )
)

watch(
  [limitPerPage, sortItem, sortOrder],
  () => {
    currentPage.value = 1
  }
)
watch(totalPages, page => {
  if(currentPage.value > page){
      currentPage.value = page
  }
})
</script>
<template>
  <div ref="rootRef" class="result-list-panel">
    <div class="result-count-zone pa-1 pl-3 border-b bg-grey-lighten-4">
      <div class="d-flex flex-column text-left">
        <div class="text-grey-darken-2 font-weight-medium" style="line-height: 1.3;">
          検索結果: <span class="font-weight-bold text-primary">{{ props.totalCount }}</span> 件
        </div>
        <div class="text-grey-darken-1" style="line-height: 1.2; font-size: 0.75rem;">
          {{ fromIndex }} ～ {{ toIndex }} 件を表示
        </div>
      </div>

      <v-divider v-if="!mobile"/>

      <div class="zone-right">
        <!-- <div v-if="!mobile" class="status-labels d-flex flex-column text-right mr-3">
          <span class="text-grey-darken-3 font-weight-medium" style="line-height: 1.1; font-size: 11px;">
            {{ currentSortLabel }}
          </span>
          <span class="text-primary font-weight-bold mt-0.5" style="line-height: 1.1; font-size: 11px;">
            {{ currentLimitLabel }}
          </span>
        </div> -->

        <CardSearchResultDisplaySettings
          v-model:sort-item="sortItem"
          v-model:sort-order="sortOrder"
          v-model:limit-per-page="limitPerPage"
          :sort-options="sortOptions"
          :sort-orders="sortOrders"
          :limit-options="limitOptions"
        />
    <!--       
        <v-btn
          variant="outlined"
          density="comfortable"
          color="grey-darken-2"
          class="font-weight-bold flex-grow-1 button-border"
          style="height: 34px;"
          :style="{
            flex: mobile ? '1' : 'none',
            marginLeft: mobile ? '0' : '8px' 
          }"
          prepend-icon="mdi-tune"
          @click="isDisplaySettingsOpen = true"
        >
        表示条件
      </v-btn> -->

      </div>
    </div>

    <CardSearchResultItem 
      v-for="card in cards" 
      :key="card.card_id" 
      :card="card" 
    />

    <!-- <div 
      v-for="card in cards" 
      :key="card.id"
      class="card-list-item d-flex align-center"
      :class="`category-${card.category}`"
    >
      <div class="item-inner-flex d-flex align-center w-100">
        
        <div class="block-main d-flex align-center flex-shrink-0">
          <span class="card-id mr-3 text-caption text-grey">{{ card.id }}</span>
          <span class="card-name font-weight-bold text-body-2 text-truncate" :title="card.name">
            {{ card.name }}
          </span>
        </div>

        <div class="block-meta d-flex align-center flex-shrink-0 mx-4">
          <v-chip
            size="x-small"
            variant="flat"
            class="mr-2 element-chip font-weight-bold"
            :class="`element-${card.element}`"
          >
            {{ card.element }}
          </v-chip>
          <span class="card-type text-caption text-grey-darken-2 text-truncate">
            {{ card.type }}
          </span>
        </div>

        <div class="block-effect flex-grow-1 text-caption text-grey mx-2 text-clamp-2">
          {{ card.effect }}
        </div>

        <div class="block-stats text-right flex-shrink-0 ml-auto pl-3 font-weight-medium text-body-2">
          <template v-if="card.category === 'unit'">
            <span class="stat-lbl">Lv</span>{{ card.stats.level }}
            <span class="mx-1 text-grey-lighten-1">/</span>
            <span class="stat-lbl text-red-darken-1">A</span>{{ card.stats.atk }}
            <span class="mx-1 text-grey-lighten-1">/</span>
            <span class="stat-lbl text-blue-darken-1">D</span>{{ card.stats.def }}
          </template>
          
          <template v-else-if="card.category === 'spell'">
            <span class="stat-tag spell-tag">{{ card.stats.timing }}</span>
            <span class="ml-2 text-caption text-grey">コスト: {{ card.stats.cost }}</span>
          </template>

          <template v-else-if="card.category === 'terrain'">
            <span class="stat-tag terrain-tag">リミット: {{ card.stats.limit }}</span>
          </template>
        </div>

      </div>
    </div> -->
  </div>

  <div class="result-footer d-flex justify-center mt-0 pt-2">
    <v-pagination
      v-if="!mobile"
      v-model="currentPage"
      :length="totalPages"
      density="compact"
      active-color="primary"
      variant="flat"
      class="zone-center-pagination"
      :total-visible="9"
    />
    
    <div v-else class="d-flex align-center justify-space-between w-100 px-2" style="max-width: 300px;">
      <v-btn
        :disabled="currentPage === 1"
        variant="outlined"
        size="small"
        height="34"
        density="comfortable"
        color="grey-darken-2"
        prepend-icon="mdi-chevron-left"
        class="font-weight-bold border-thin align-center pagenation-button"
        @click="currentPage--"
      >
        前へ
      </v-btn>
      
      <span class="text-caption font-weight-bold text-grey-darken-2">
        {{ currentPage }} / {{ totalPages }} ページ
      </span>
      
      <v-btn
        :disabled="currentPage === totalPages"
        variant="outlined"
        size="small"
        height="34"
        density="comfortable"
        color="grey-darken-2"
        append-icon="mdi-chevron-right"
        class="font-weight-bold border-thin align-center pagenation-button"
        @click="currentPage++"
      >
        次へ
      </v-btn>
    </div>
  </div>
</template>
<style scoped>
.pagenation-button :deep(.v-btn__content) {
  position: relative;
  top: -1px;
}
.cursor-pointer { cursor: pointer; }

/* モバイル表示時のFlexboxフォールバック */
@media (max-width: 839px) {
  .result-count-zone {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

/* =========================================================================
 * カードリストアイテム
 * ========================================================================= */
 /* .card-list-item {
  background-color: #ffffff;
  border-color: #e0e0e0 !important;
  transition: background-color 0.2s, border-color 0.2s;
  cursor: pointer;
  border-left: 4px solid #bdbdbd !important;
} */
.card-list-item{
    display:flex;
    align-items:center;
    padding:12px 16px;
    border-bottom:1px solid #d8dee4;
    transition:
        background .15s,
        border-color .15s;
    cursor:pointer;
    border-left:4px solid #bdbdbd;
}
.card-list-item:last-child{
    border-bottom:none;
}
.card-list-item:hover {
  background-color: #f7fbe8;
}

.card-list-item.category-unit { border-left-color: #7eba03 !important; }
.card-list-item.category-spell { border-left-color: #009da5 !important; }
.card-list-item.category-terrain { border-left-color: #8d6e63 !important; }

.block-main { width: 220px; }
.block-meta { width: 140px; }
.block-stats { width: 160px; }

.text-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
  min-width: 0;
}

.stat-lbl {
  font-size: 0.65rem;
  color: #757575;
  text-transform: uppercase;
  margin-right: 2px;
}

.stat-tag {
  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: bold;
}
.spell-tag { background-color: #e0f7fa; color: #006064; }
.terrain-tag { background-color: #efebe9; color: #4e342e; }

.element-chip {
  min-width: 32px;
  justify-content: center;
}
.element-地 { background-color: #8d6e63; color: white; }
.element-光 { background-color: #fbc02d; color: black; }
.element-闇 { background-color: #37474f; color: white; }
.element-風 { background-color: #4caf50; color: white; }

/* =========================================================================
 * ページネーションアイテム
 * ========================================================================= */

 /* ページネーションコントロールバー (CSS Grid) */
@media (min-width: 840px) {
  .result-count-zone {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr !important;
    align-items: center;
    min-height: 38px;
  }
  .zone-center-pagination {
    display: flex;
    justify-content: center;
  }
  .zone-right {
    display: flex;
    justify-content: flex-end;
  }
}

.zone-center-pagination :deep(.v-pagination__ellipsis) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  cursor: default !important;
  pointer-events: none;
}

.zone-center-pagination :deep(.v-pagination__ellipsis .v-btn) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  opacity: 1 !important;
  color: #9e9e9e !important;
  min-width: auto !important;
  width: auto !important;
  padding: 0 6px !important;
}

.zone-center-pagination :deep(.v-pagination__ellipsis .v-btn__overlay),
.zone-center-pagination :deep(.v-pagination__ellipsis .v-btn__underlay) {
  display: none !important;
}

.zone-center-pagination :deep(.v-pagination__list) {
  list-style: none;
  margin: 0;
  padding-left: 0;
}

.zone-center-pagination :deep(.v-btn--disabled .v-btn__overlay),
.zone-center-pagination :deep(.v-btn--disabled .v-btn__underlay) {
  display: none;
}
/* hover */
.zone-center-pagination
:deep(.v-pagination__item:not(.v-pagination__item--is-active) .v-btn:hover) {
  background: #f6f8fa !important;
  transition: background-color .12s ease;
}
/* disabled */
.zone-center-pagination :deep(.v-btn--disabled) {
  background: transparent !important;
  opacity: .45;
}
.zone-center-pagination :deep(.v-btn) {
  transition: background-color .15s;
  border-radius: 6px;

}

.button-border {
  border: 1px solid #26a326;
}
.result-list-panel{
    border:1px solid #d8dee4;
    border-radius:10px;
    overflow:hidden;
    background:#fff;
}
</style>