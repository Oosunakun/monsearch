<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import SearchFilterWithOperator from '~~/app/components/molecules/common/SearchFilterWithOperator.vue'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition,
  createNumericCondition,
  createFilteredNumericCondition,
  createSlotCondition,
} from '~/utils/search/cardSearchFormFactory'
import {
  isChangedNumericCondition,
  isChangedFilteredNumericCondition,
  isChangedSlotCondition,
} from '~/utils/search/cardSearchChanged'
import type { SearchForm } from '~~/app/types/ui/search'
import { LEVEL_OPTIONS } from '~~/app/utils/constants/search/options'
import { LEVEL_SEARCH_FILTER_OPTIONS } from '~~/app/utils/constants/search/conditions'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedFilteredNumericCondition(
    model.value.level,
    defaultFilteredNumericCondition,
  )
})
const resetAll = () => {
  model.value.level = createFilteredNumericCondition()
}
</script>
<template>
  <CardSearchRow
    label="レベル"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
  <SearchFilterWithOperator
    v-model:filterType="model.level.filterType"
    v-model:value="model.level.value"
    v-model:operator="model.level.operator"
    :options="LEVEL_SEARCH_FILTER_OPTIONS"
    :alwaysShowValue="true"
    :items="LEVEL_OPTIONS"
  />
  </CardSearchRow>
</template>