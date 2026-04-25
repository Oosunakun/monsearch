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
import { UI_COLORS } from '~~/app/utils/constants/colors'
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
const expansionPanels = ref<number[]>([0])
const resultSectionRef = ref<HTMLElement | null>(null)
const activeConditionChips = ref<string[]>([])

const SEARCH_SIMULATION_DELAY_MS = 1800

const createActiveConditionChips = (payload: ReturnType<typeof toSearchRequestDto>): string[] => {
  const chips: string[] = []

  if (payload.card_name) chips.push(`カード名: ${payload.card_name}`)
  if (payload.category_code) chips.push(`カテゴリ: ${payload.category_code}`)
  if (payload.rarity_code) chips.push(`レア: ${payload.rarity_code}`)
  if (payload.card_pool_code) chips.push(`カードプール: ${payload.card_pool_code}`)
  if (payload.set_code) chips.push(`セット: ${payload.set_code}`)
  if (payload.unit.move_type_code) chips.push(`移動タイプ: ${payload.unit.move_type_code}`)
  if (payload.unit.element_codes.length > 0) chips.push(`属性: ${payload.unit.element_codes.join(', ')}`)
  if (payload.race_type.race_keyword) chips.push(`種族: ${payload.race_type.race_keyword}`)
  if (payload.race_type.card_type_keyword) chips.push(`カードタイプ: ${payload.race_type.card_type_keyword}`)
  if (payload.keyword) chips.push(`キーワード: ${payload.keyword}`)

  return chips
}

const scrollToResultSection = () => {
  resultSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const resetConditions = () => {
  resetForm()
  isSearchResultError.value = false
  isSearchResultLoading.value = false
  displayedRows.value = []
  activeConditionChips.value = []
  expansionPanels.value = [0]
}

const runSearch = async () => {
  if (isSearchResultLoading.value) return

  const payload = toSearchRequestDto()
  console.info('mock search payload', payload)

  activeConditionChips.value = createActiveConditionChips(payload)
  expansionPanels.value = []
  scrollToResultSection()

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
      <v-expansion-panels v-model="expansionPanels" multiple variant="accordion">
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
        <v-btn
          :color="UI_COLORS.PRIMARY"
          size="large"
          type="submit"
          :loading="isSearchResultLoading"
          :disabled="isSearchResultLoading"
        >
          検索する
        </v-btn>
        <v-btn
          :color="UI_COLORS.SECONDARY"
          variant="outlined"
          size="large"
          :disabled="isSearchResultLoading"
          @click="resetConditions"
        >
          条件をリセット
        </v-btn>
      </div>
    </v-form>

    <div ref="resultSectionRef" class="mt-6">
      <AppSectionHeader title="検索結果" class="mb-3" />
      <ResultCountLabel :count="isSearchResultLoading || isSearchResultError ? 0 : results.length" prefix="" />
    </div>

    <CardSearchResultTable
      :headers="headers"
      :items="results"
      :active-condition-chips="activeConditionChips"
      :is-loading="isSearchResultLoading"
      :is-error="isSearchResultError"
      :error-title="searchErrorTitle"
      :error-text="searchErrorText"
    >
      <template #empty-actions>
        <v-btn :color="UI_COLORS.SECONDARY" variant="outlined" @click="resetConditions">
          検索条件をクリア
        </v-btn>
      </template>

      <template #error-actions>
        <v-btn :color="UI_COLORS.SECONDARY" variant="flat" @click="runSearch">
          再試行
        </v-btn>
      </template>
    </CardSearchResultTable>
  </section>
</template>
