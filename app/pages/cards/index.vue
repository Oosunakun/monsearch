<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDisplay } from 'vuetify'
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import SectionCardShell from '~~/app/components/molecules/common/SectionCardShell.vue'

import CardSearchResultControls from '~~/app/components/organisms/cards/CardSearchResultControls.vue'
import CardSearchResultSummary from '~~/app/components/organisms/cards/CardSearchResultSummary.vue'
import CardSearchResultList from '~~/app/components/organisms/cards/CardSearchResultList.vue'
import CardSearchResultConditionViewer from '~~/app/components/organisms/cards/CardSearchResultConditionViewer.vue'
import CardSearchResultDisplaySettings from '~~/app/components/organisms/cards/CardSearchResultDisplaySettings.vue'

import { mockFinderCards}  from '~~/app/utils/mockData/cards'

import { CARD_CATEGORY } from '~~/app/utils/constants/search/options/'

// Vuetifyのレスポンシブ表示ユーティリティ
const { mdAndUp } = useDisplay()
const isConditionOpen = ref(false)

// 状態定義
const sortItem = ref('id')
const sortOrder = ref<'asc' | 'desc'>('asc')
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Mockデータ
const sortedCards = computed(() => {
  const cards = [...mockFinderCards.cards]

  cards.sort((a, b) => {
    let result = 0

    switch (sortItem.value) {
      case 'id':
        result = a.card_id.localeCompare(b.card_id)
        break

      case 'rarity':
        result = (rarityOrderMap[a.rarity_code] ?? 0) - (rarityOrderMap[b.rarity_code] ?? 0)
        break

      case 'atk':
        result =
          (a.unit?.attack ?? 0) -
          (b.unit?.attack ?? 0)
        break
    }

    return sortOrder.value === 'asc'
      ? result
      : -result
  })

  return cards
})
const rarityOrderMap: Record<string, number> = {
  Basic: 1,
  Common: 2,
  Uncommon: 3,
  Rare: 4,
  SuperRare: 5,
  Special: 6,
  DragonJr: 7,
  Promotion: 8,
  Summoner: 9,
};

// 表示カードデータ
const totalCount = computed(() => sortedCards.value.length)
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalCount.value / itemsPerPage.value))
)
const pagedCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value

  return sortedCards.value.slice(start, end)
})

// 仮の検索条件データ
const searchConditions = ref({
  keyword: 'エメラルド',
  elements: ['地', '風'],
  categories: ['ユニット', '戦闘スペル'],
  rarities: ['SR', 'R'],
})

// 表示用検索条件アイテムの最適化（重複削減）
const conditionItems = computed(() => [
  { label: 'キーワード', value: searchConditions.value.keyword },
  { label: '属性', value: searchConditions.value.elements.join(', ') },
  { label: 'カード分類', value: searchConditions.value.categories.join(', ') },
  { label: 'レアリティ', value: searchConditions.value.rarities.join(', ') },
])

// 全検索結果に対する分類別内訳のダミーデータ（統計値）
const categoryBreakdown = computed(() => {
  const counts = new Map<string, number>()
  for (const card of sortedCards.value) {
    counts.set(
      card.card_category_code,
      (counts.get(card.card_category_code) ?? 0) + 1
    )
  }

  return [
    {
      label: 'ユニット',
      count: counts.get('Unit') ?? 0,
      color: CARD_CATEGORY.UNIT.color,
    },
    {
      label: '戦闘スペル',
      count: counts.get('Spell') ?? 0,
      color: CARD_CATEGORY.SPELL.color,
    },
    {
      label: 'アイテム',
      count: counts.get('Item') ?? 0,
      color: CARD_CATEGORY.ITEM_CONSUME.color,
    },
    {
      label: '地形',
      count: counts.get('Land') ?? 0,
      color: CARD_CATEGORY.LAND.color,
    },
    {
      label: '儀式スペル',
      count: counts.get('Ritual') ?? 0,
      color: CARD_CATEGORY.RITUAL.color,
    },
    {
      label: '召喚術師',
      count: counts.get('Summoner') ?? 0,
      color: CARD_CATEGORY.SUMMONER.color,
    },
    {
      label: 'トークン',
      count: counts.get('Token') ?? 0,
      color: CARD_CATEGORY.TOKEN.color,
    },
  ].filter(x => x.count > 0)
})

const resultListRef = ref<InstanceType<typeof CardSearchResultList>>()
  watch(currentPage, async () => {
  await nextTick()

  resultListRef.value?.scrollToTop()
})
</script>
<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="検索結果一覧" color="primary" text-class="text-white" />
      </template>

      <CardSearchResultControls
        :conditions="conditionItems"
      />

      <CardSearchResultSummary
        :items="categoryBreakdown"
      />

      <CardSearchResultList
        ref="resultListRef"
        :cards="pagedCards"
        :total-count="totalCount"
        v-model:current-page="currentPage"
        v-model:total-pages="totalPages"
        v-model:limit-per-page="itemsPerPage"
        v-model:sort-item="sortItem"
        v-model:sort-order="sortOrder"
      />

      <!-- <div class="d-flex align-center justify-start mb-3">
        <v-btn
          variant="flat"
          density="comfortable"
          color="primary"
          class="text-caption font-weight-bold mr-2"
          prepend-icon="mdi-pencil"
          @click="navigateToSearchForm"
        >
          条件を編集
        </v-btn>

        <v-btn
          variant="outlined"
          density="comfortable"
          color="grey-darken-2"
          class="text-caption font-weight-bold bg-white"
          prepend-icon="mdi-magnify-eye"
          @click="openSearchCondition"
        >
          検索条件表示
        </v-btn>
      </div>

      <div class="d-none d-md-block mb-3 pa-2 bg-grey-lighten-5 rounded border">
        <div class="d-flex flex-wrap gap-2">
          <v-chip v-for="item in categoryBreakdown" :key="item.label" size="small" variant="flat" :color="item.color" class="mr-2">
            {{ item.label }}: {{ item.count }}件
          </v-chip>
        </div>
      </div>

      <div class="result-count-zone pb-3 mb-3 border-b">
        
        <div class="d-flex flex-column text-left">
          <div class="text-body-2 text-grey-darken-2-height-tight" style="line-height:1.2">
            該当件数: <span class="font-weight-bold text-primary text-body-1">52</span> 件
          </div>
          <div class="text-caption text-grey mt-0.5 pl-0.5" style="line-height:1.2">
            ({{ currentPage }} / {{ totalPages }}ページ)
          </div>
        </div>

        <v-pagination
          v-if="mdAndUp"
          v-model="currentPage"
          :length="totalPages"
          density="comfortable"
          active-color="primary"
          variant="flat"
          class="zone-center"
          :total-visible="totalPages"
        />

        <div 
          class="display-settings-trigger d-flex align-center py-1 px-3 rounded border bg-white cursor-pointer zone-right"
          @click="isDisplaySettingsOpen = true"
        >
          <div v-if="mdAndUp" class="d-flex flex-column text-right mr-2">
            <span class="text-grey-darken-3 font-weight-medium text-caption" style="line-height:1.2">
              {{ currentSortLabel }}
            </span>
            <span class="text-primary font-weight-bold text-caption mt-0.5" style="line-height:1.2">
              {{ currentLimitLabel }}表示
            </span>
          </div>

          <div v-else class="text-caption font-weight-bold text-grey-darken-2 mr-1">
            表示設定
          </div>

          <v-icon color="primary" size="small">mdi-cog</v-icon>
        </div>

      </div>

      <div 
        v-for="card in filteredCardResults" 
        :key="card.id"
        class="card-list-item d-flex align-center py-2 px-3 mb-2 border rounded"
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
      </div>

      <div class="result-footer d-flex justify-center mt-4 pt-2 border-t">
        <v-pagination
          v-if="mdAndUp"
          v-model="currentPage"
          :length="totalPages"
          density="comfortable"
          active-color="primary"
          variant="flat"
          :total-visible="totalPages"
        />
        
        <div v-else class="d-flex align-center justify-space-between w-100 px-2" style="max-width: 300px;">
          <v-btn
            :disabled="currentPage === 1"
            variant="outlined"
            size="small"
            density="comfortable"
            color="grey-darken-2"
            prepend-icon="mdi-chevron-left"
            class="text-caption font-weight-bold bg-white"
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
            density="comfortable"
            color="grey-darken-2"
            append-icon="mdi-chevron-right"
            class="text-caption font-weight-bold bg-white"
            @click="currentPage++"
          >
            次へ
          </v-btn>
        </div>
      </div>

      <v-dialog v-model="isConditionModalOpen" max-width="500px">
        <v-card>
          <v-card-title class="bg-grey-lighten-3 text-body-2 font-weight-bold py-3">現在の検索条件</v-card-title>
          <v-card-text class="pa-4 text-body-2">
            <div v-for="item in conditionItems" :key="item.label" class="mb-2">
              <strong>{{ item.label }}:</strong> {{ item.value }}
            </div>
          </v-card-text>
          <v-card-actions class="justify-end border-t pa-2">
            <v-btn variant="text" size="small" @click="isConditionModalOpen = false">閉じる</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-bottom-sheet v-model="isConditionSheetOpen">
        <v-card rounded="t-xl">
          <v-card-title class="text-center text-caption font-weight-bold pt-4 pb-2 border-b">現在の検索条件</v-card-title>
          <div class="pa-4 text-caption">
            <div v-for="item in conditionItems" :key="item.label" class="mb-2">
              <strong>{{ item.label }}:</strong> {{ item.value }}
            </div>
            <v-btn block color="grey-darken-1" variant="flat" size="small" class="mt-4" @click="isConditionSheetOpen = false">閉じる</v-btn>
          </div>
        </v-card>
      </v-bottom-sheet>

      <v-bottom-sheet v-model="isDisplaySettingsOpen">
        <v-card rounded="t-xl" class="mx-auto" max-width="600px">
          <v-card-title class="text-center text-body-2 font-weight-bold pt-4 pb-2 border-b">表示設定の変更</v-card-title>
          <div class="pa-4">
            
            <div class="mb-4">
              <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">並び順</label>
              <v-select v-model="currentSort" :items="sortOptions" density="compact" variant="outlined" hide-details />
            </div>

            <div class="mb-6">
              <label class="text-caption font-weight-bold text-grey-darken-2 d-block mb-1">表示件数</label>
              <v-select
                v-model="itemsPerPage"
                :items="limitOptions"
                density="compact"
                variant="outlined"
                hide-details
              >
                <template #item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.value + '件ずつ表示'" />
                </template>
              </v-select>
            </div>

            <div class="d-flex">
              <v-btn variant="outlined" color="grey" class="w-50 mr-2" size="small" @click="isDisplaySettingsOpen = false">キャンセル</v-btn>
              <v-btn color="primary" variant="flat" class="w-50" size="small" @click="applyDisplaySettings">設定を適用</v-btn>
            </div>

          </div>
        </v-card>
      </v-bottom-sheet> -->

    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>

<style scoped>
/* .border-b {
  border-bottom: 1px solid #e0e0e0;
}
.border-t {
  border-top: 1px solid #e0e0e0;
}

.cursor-pointer { cursor: pointer; }

.display-settings-trigger { transition: background-color 0.2s; white-space: nowrap !important; }
.display-settings-trigger:hover { background-color: #f5f5f5 !important; } */

/* =========================================================================
 * ページネーション位置ズレ対策：メインコントロールバー (CSS Grid)
 * ========================================================================= */
/* @media (min-width: 840px) {
  .result-count-zone {
    display: grid !important;
    grid-template-columns: 1fr auto 1fr !important;
    align-items: center;
  }
  .zone-center {
    display: flex;
    justify-content: center;
  }
  .zone-right {
    display: flex;
    justify-content: flex-end;
  }
}

@media (max-width: 839px) {
  .result-count-zone {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
} */

/* =========================================================================
 * カードリストアイテム
 * ========================================================================= */
/* .card-list-item {
  background-color: #ffffff;
  border-color: #e0e0e0 !important;
  transition: background-color 0.2s, border-color 0.2s;
  cursor: pointer;
  border-left: 4px solid #bdbdbd !important;
}

.card-list-item:hover {
  background-color: #f7fbe8;
  border-color: #7eba03 !important;
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
.element-風 { background-color: #4caf50; color: white; } */

/* =========================================================================
 * レスポンシブ対応
 * ========================================================================= */
/* @media (max-width: 839px) {
  .item-inner-flex {
    flex-wrap: wrap;
  }
  .block-main {
    width: 60%;
  }
  .block-stats {
    width: 40%;
    margin-left: auto;
  }
  .block-meta {
    width: 100%;
    margin: 4px 0 !important;
  }
  .block-effect {
    width: 100%;
    margin: 4px 0 0 0 !important;
    border-top: 1px dashed #eee;
    padding-top: 4px;
  }
} */

 
</style>
