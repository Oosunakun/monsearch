<script setup lang="ts">
import { ref, computed } from 'vue'
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'

import ResultControls from '~~/app/components/cards/result/controls/ResultControls.vue'
import ResultSummary from '~~/app/components/cards/result/summary/ResultSummary.vue'
import ResultList from '~~/app/components/cards/result/layout/ResultList.vue'
import { mockFinderCards}  from '~~/app/utils/mockData/cards'
import { CARD_CATEGORY } from '~~/app/utils/constants/search/options/'
import { useRoute } from 'vue-router'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'

const route = useRoute()
const searchForm = computed(() => parseCardSearchQuery(route.query))

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

// 表示用検索条件アイテムの最適化（仮置き）
const conditionItems = computed(() => {
  const form = searchForm.value
  return [form.name, form.keyword, form.effectText, form.referenceLabel]
    .filter(Boolean)
    .map(value => ({ label: value, value }))
})

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

const resultListRef = ref<InstanceType<typeof ResultList>>()
  watch(currentPage, async () => {
  await nextTick()

  resultListRef.value?.scrollToTop()
})
</script>
<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <SectionHeader title="検索結果一覧" color="primary" text-class="text-white" />
      </template>

      <ResultControls
        :conditions="conditionItems"
      />

      <ResultSummary
        :items="categoryBreakdown"
      />

      <ResultList
        ref="resultListRef"
        v-model:current-page="currentPage"
        v-model:total-pages="totalPages"
        v-model:limit-per-page="itemsPerPage"
        v-model:sort-item="sortItem"
        v-model:sort-order="sortOrder"
        :cards="pagedCards"
        :total-count="totalCount"
      />
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>
