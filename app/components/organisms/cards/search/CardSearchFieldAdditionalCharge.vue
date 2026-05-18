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
import { CHARGE_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedFilteredNumericCondition(
    model.value.additionalCharge,
    defaultFilteredNumericCondition,
  )
})
const resetAll = () => {
  model.value.additionalCharge = createFilteredNumericCondition()
}
</script>
<template>
  <CardSearchRow
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
    v-model:filterType="model.additionalCharge.filterType"
    v-model:value="model.additionalCharge.value"
    v-model:operator="model.additionalCharge.operator"
    :items="CHARGE_OPTIONS"
  />
  </CardSearchRow>
</template>