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

    <p class="text-subtitle-1 font-weight-bold mb-2" style="color: #3E2723;">
      検索結果 {{ cardRows.length }}件
    </p>

    <CardListTable :headers="headers" :items="cardRows" @row-click="openCardDetail" />

    <CardDetailModal
      v-if="selectedCard"
      v-model="detailModalOpen"
      :card="selectedCard"
    />
  </section>
</template>
