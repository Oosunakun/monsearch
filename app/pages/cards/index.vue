<script setup lang="ts">
import type { CardDetail } from '~~/types/card'
import type {
  CardListHeader,
  CardListRow,
  CardListSourceRow,
  SearchCondition
} from '~~/app/types/ui/cards'
import ActiveConditionChips from '~~/app/components/molecules/cards/ActiveConditionChips.vue'
import CardListTable from '~~/app/components/organisms/cards/CardListTable.vue'
import ResultCountLabel from '~~/app/components/atoms/common/ResultCountLabel.vue'
import CardDetailModal from '~~/app/components/organisms/cards/CardDetailModal.vue'
import {
  mockActiveSearchConditions,
  mockCardListHeaders,
  mockCardListSourceRows
} from '~~/app/utils/mockData'

const headers: CardListHeader[] = mockCardListHeaders

const activeConditions = ref<SearchCondition[]>([...mockActiveSearchConditions])
const sourceRows: CardListSourceRow[] = mockCardListSourceRows

const cardRows = computed<CardListRow[]>(() =>
  sourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)

const isListLoading = ref(false)
const isDetailLoading = ref(false)

const detailModalOpen = ref(false)
const selectedCard = ref<CardDetail | null>(null)
const { mapCardRowToDetail } = useCardDetailMapper()

const openCardDetail = (row: CardListRow) => {
  selectedCard.value = mapCardRowToDetail(row)
  detailModalOpen.value = true
}

const clearConditions = () => {
  activeConditions.value = []
}
</script>

<template>
  <section>
    <ActiveConditionChips :conditions="activeConditions" @clear="clearConditions" />

    <ResultCountLabel :count="cardRows.length" />

    <CardListTable
      :headers="headers"
      :items="cardRows"
      :is-loading="isListLoading"
      @row-click="openCardDetail"
    />

    <CardDetailModal
      v-if="selectedCard"
      v-model="detailModalOpen"
      :card="selectedCard"
      :is-loading="isDetailLoading"
    />
  </section>
</template>
