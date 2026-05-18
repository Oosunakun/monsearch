<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import SearchValueWithOperator from '~~/app/components/molecules/common/SearchValueWithOperator.vue'
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
import { INITIATIVE_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedNumericCondition(
    model.value.additionalInitiative,
    defaultNumericCondition,
  )
})
const resetAll = () => {
  model.value.additionalInitiative = createNumericCondition()
}
</script>
<template>
  <CardSearchRow
    label="イニシアチブ"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
  <SearchValueWithOperator
    v-model="model.additionalInitiative.value"
    v-model:operator="model.additionalInitiative.operator"
    :items="INITIATIVE_OPTIONS"
  />
  </CardSearchRow>
</template>