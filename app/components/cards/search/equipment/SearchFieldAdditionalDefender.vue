<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import SearchFilterWithOperator from '~~/app/components/cards/search/shared/SearchFilterWithOperator.vue'
import { 
  defaultFilteredNumericCondition,
  createFilteredNumericCondition,
} from '~/utils/search/cardSearchFormFactory'
import {
  isChangedFilteredNumericCondition,
} from '~/utils/search/cardSearchChanged'
import type { SearchForm } from '~~/app/types/ui/search'
import { DEFENDER_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedFilteredNumericCondition(
    model.value.additionalDefender,
    defaultFilteredNumericCondition,
  )
})
const resetAll = () => {
  model.value.additionalDefender = createFilteredNumericCondition()
}
</script>
<template>
  <SearchRow
    label="ディフェンダー"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
  <SearchFilterWithOperator
    v-model:filter-type="model.additionalDefender.filterType"
    v-model:value="model.additionalDefender.value"
    v-model:operator="model.additionalDefender.operator"
    :items="DEFENDER_OPTIONS"
  />
  </SearchRow>
</template>