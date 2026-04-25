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
const results = computed(() => withZebraRows(sourceRows))
const isSearchResultLoading = ref(false)

const resetConditions = () => {
  resetForm()
}

const runSearch = () => {
  const payload = toSearchRequestDto()
  console.info('mock search payload', payload)
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
    <ResultCountLabel :count="isSearchResultLoading ? 0 : results.length" prefix="" />

    <CardSearchResultTable :headers="headers" :items="results" :is-loading="isSearchResultLoading">
      <template #actions>
        <v-btn variant="outlined" color="secondary" @click="resetConditions">
          検索条件をクリア
        </v-btn>
      </template>
    </CardSearchResultTable>
  </section>
</template>
