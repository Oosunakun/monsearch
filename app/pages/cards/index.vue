<script setup lang="ts">
import { useAnalytics } from '~~/app/composables/useAnalytics'
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'
import EmptyState from '~~/app/components/common/app/EmptyState.vue'
import ErrorState from '~~/app/components/common/app/ErrorState.vue'
import ResultControls from '~~/app/components/cards/result/controls/ResultControls.vue'
import ResultSummary from '~~/app/components/cards/result/summary/ResultSummary.vue'
import ResultList from '~~/app/components/cards/result/layout/ResultList.vue'
import { CARD_CATEGORY } from '~~/app/utils/constants/search/options/'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'

const route = useRoute()
const routeQuery = computed(() => route.query)
const searchForm = computed(() => parseCardSearchQuery(route.query))
const { page: currentPage, perPage: itemsPerPage, sort: sortItem, order: sortOrder, result, status, retry } = useCardSearch(routeQuery)
const analytics = useAnalytics()
// pending時のURLを保持し、成功確定前の残存resultを新条件の結果として送らない。
let resultPath: string | undefined
watch(status, value => {
  if (value === 'pending') resultPath = route.fullPath
  if (value === 'success' && result.value && resultPath === route.fullPath) {
    analytics.results(resultPath, result.value.totalCount)
  }
}, { flush: 'sync', immediate: true })
const conditionItems = computed(() => [searchForm.value.name, searchForm.value.keyword, searchForm.value.effectText, searchForm.value.referenceLabel]
  .filter(Boolean).map(value => ({ label: value, value })))
const categoryLabels: Record<string, { label: string, color: string }> = {
  Unit: { label: 'ユニット', color: CARD_CATEGORY.UNIT.color }, Spell: { label: '戦闘スペル', color: CARD_CATEGORY.SPELL.color },
  Item: { label: 'アイテム', color: CARD_CATEGORY.ITEM_CONSUME.color }, Land: { label: '地形', color: CARD_CATEGORY.LAND.color },
  Ritual: { label: '儀式スペル', color: CARD_CATEGORY.RITUAL.color }, Summoner: { label: '召喚術師', color: CARD_CATEGORY.SUMMONER.color },
  Token: { label: 'トークン', color: CARD_CATEGORY.TOKEN.color },
}
const categoryBreakdown = computed(() => (result.value?.categoryBreakdown ?? []).map(item => ({
  label: categoryLabels[item.categoryCode]?.label ?? item.categoryCode,
  color: categoryLabels[item.categoryCode]?.color ?? 'grey', count: item.count,
})))
const resultListRef = ref<InstanceType<typeof ResultList>>()
const pendingScroll = shallowRef<{ page: number, previousResult: typeof result.value }>()
const requestPageScroll = (page: number) => {
  pendingScroll.value = { page, previousResult: result.value }
}

// 履歴復帰や表示条件の変更へ、ページ送りの要求を持ち越さない。
watch([routeQuery, itemsPerPage, sortItem, sortOrder], () => {
  pendingScroll.value = undefined
}, { deep: true, flush: 'sync' })
watch(currentPage, page => {
  if (pendingScroll.value?.page !== page) pendingScroll.value = undefined
}, { flush: 'sync' })
watch(status, value => {
  if (value === 'error') pendingScroll.value = undefined
}, { flush: 'sync' })

watch([status, result, resultListRef, pendingScroll], () => {
  const request = pendingScroll.value
  if (!request || status.value !== 'success') return
  if (!result.value || result.value.totalCount === 0) {
    pendingScroll.value = undefined
    return
  }
  if (result.value === request.previousResult || result.value.page !== request.page || !resultListRef.value) return
  pendingScroll.value = undefined
  resultListRef.value.scrollToTop()
}, { flush: 'post' })
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header><SectionHeader title="検索結果一覧" color="primary" text-class="text-white" /></template>
      <ResultControls :conditions="conditionItems" :query="route.query" />
      <SkeletonLoader v-if="status === 'idle' || status === 'pending'" />
      <ErrorState v-else-if="status === 'error'">
        <template #actions><v-btn color="primary" @click="retry">再試行</v-btn></template>
      </ErrorState>
      <EmptyState v-else-if="result && result.totalCount === 0" title="該当するカードはありません" />
      <template v-else-if="result">
        <ResultSummary :items="categoryBreakdown" />
        <ResultList
          ref="resultListRef" v-model:current-page="currentPage" v-model:total-pages="result.totalPages"
          v-model:limit-per-page="itemsPerPage" v-model:sort-item="sortItem" v-model:sort-order="sortOrder"
          :cards="result.items" :total-count="result.totalCount"
          @page-scroll-request="requestPageScroll" />
      </template>
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>
