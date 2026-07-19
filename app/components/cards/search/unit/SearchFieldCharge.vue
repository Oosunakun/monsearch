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
import { CHARGE_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedFilteredNumericCondition(
    model.value.charge,
    defaultFilteredNumericCondition,
  )
})
const resetAll = () => {
  model.value.charge = createFilteredNumericCondition()
}
</script>
<template>
  <SearchRow
    label="チャージ"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
  <SearchFilterWithOperator
    v-model:filter-type="model.charge.filterType"
    v-model:value="model.charge.value"
    v-model:operator="model.charge.operator"
    :items="CHARGE_OPTIONS"
  />
  </SearchRow>
</template>