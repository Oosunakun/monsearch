<script setup lang="ts">
import type {
  ElementOption,
  SearchResultHeader,
  SearchResultSource,
  SelectOption
} from '~~/app/types/ui/search'
import CardSearchFormBasic from '~~/app/components/organisms/cards/CardSearchFormBasic.vue'
import CardSearchFormUnit from '~~/app/components/organisms/cards/CardSearchFormUnit.vue'
import CardSearchFormRaceType from '~~/app/components/organisms/cards/CardSearchFormRaceType.vue'
import CardSearchFormKeyword from '~~/app/components/organisms/cards/CardSearchFormKeyword.vue'
import CardSearchResultTable from '~~/app/components/organisms/cards/CardSearchResultTable.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import ResultCountLabel from '~~/app/components/atoms/common/ResultCountLabel.vue'
import {
  mockCardSearchResultSourceRows,
  mockSearchCardPoolOptions,
  mockSearchCategoryOptions,
  mockSearchElementOptions,
  mockSearchMoveTypeOptions,
  mockSearchRarityOptions,
  mockSearchResultHeaders,
  mockSearchSetOptions
} from '~~/app/utils/mockData'

const categoryOptions: SelectOption[] = mockSearchCategoryOptions
const rarityOptions: SelectOption[] = mockSearchRarityOptions
const cardPoolOptions: SelectOption[] = mockSearchCardPoolOptions
const setOptions: SelectOption[] = mockSearchSetOptions
const moveTypeOptions: SelectOption[] = mockSearchMoveTypeOptions
const elementOptions: ElementOption[] = mockSearchElementOptions
const headers: SearchResultHeader[] = mockSearchResultHeaders

const sourceRows: SearchResultSource[] = mockCardSearchResultSourceRows

const { formState, resetForm, toSearchRequestDto, withZebraRows } = useCardSearchForm()
const displayedRows = ref<SearchResultSource[]>([...sourceRows])
const results = computed(() => withZebraRows(displayedRows.value))
const isSearchResultLoading = ref(false)
const isSearchResultError = ref(false)
const searchErrorTitle = ref('データの取得に失敗しました')
const searchErrorText = ref('時間をおいて再試行してください。')

const SEARCH_SIMULATION_DELAY_MS = 1800

const resetConditions = () => {
  resetForm()
  isSearchResultError.value = false
  displayedRows.value = [...sourceRows]
}

const runSearch = async () => {
  const payload = toSearchRequestDto()
  console.info('mock search payload', payload)

  isSearchResultLoading.value = true
  isSearchResultError.value = false

  await new Promise(resolve => setTimeout(resolve, SEARCH_SIMULATION_DELAY_MS))

  const shouldSimulateError = payload.keyword.toLowerCase() === 'error'
  if (shouldSimulateError) {
    isSearchResultError.value = true
    displayedRows.value = []
    isSearchResultLoading.value = false
    return
  }

  const shouldShowEmpty = payload.card_name.toLowerCase() === 'empty'
  displayedRows.value = shouldShowEmpty ? [] : [...sourceRows]
  isSearchResultLoading.value = false
}
</script>

<template>
  <section>
    <AppSectionHeader title="詳細検索" color="secondary" class="mb-4" />

    <v-form class="d-flex flex-column ga-4" @submit.prevent="runSearch">
      <v-expansion-panels multiple variant="accordion">
        <v-expansion-panel title="検索条件">
          <v-expansion-panel-text>
            <div class="d-flex flex-column ga-4">
              <CardSearchFormBasic
                :model-value="formState.basic"
                :category-options="categoryOptions"
                :rarity-options="rarityOptions"
                :card-pool-options="cardPoolOptions"
                :set-options="setOptions"
                @update:model-value="formState.basic = $event"
              />
              <CardSearchFormUnit
                :model-value="formState.unit"
                :move-type-options="moveTypeOptions"
                :element-options="elementOptions"
                @update:model-value="formState.unit = $event"
              />
              <CardSearchFormRaceType
                :model-value="formState.raceType"
                @update:model-value="formState.raceType = $event"
              />
              <CardSearchFormKeyword
                :model-value="formState.keyword"
                @update:model-value="formState.keyword = $event"
              />
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <div class="d-flex flex-wrap ga-3">
        <v-btn color="primary" size="large" type="submit">
          検索する
        </v-btn>
        <v-btn color="grey-darken-1" size="large" @click="resetConditions">
          条件をリセット
        </v-btn>
      </div>
    </v-form>

    <AppSectionHeader title="検索結果" class="mt-6 mb-3" />
    <ResultCountLabel :count="isSearchResultLoading || isSearchResultError ? 0 : results.length" prefix="" />

    <CardSearchResultTable
      :headers="headers"
      :items="results"
      :is-loading="isSearchResultLoading"
      :is-error="isSearchResultError"
      :error-title="searchErrorTitle"
      :error-text="searchErrorText"
    >
      <template #empty-actions>
        <v-btn variant="outlined" color="secondary" @click="resetConditions">
          検索条件をクリア
        </v-btn>
      </template>

      <template #error-actions>
        <v-btn color="secondary" variant="flat" @click="runSearch">
          再試行
        </v-btn>
      </template>
    </CardSearchResultTable>
  </section>
</template>
