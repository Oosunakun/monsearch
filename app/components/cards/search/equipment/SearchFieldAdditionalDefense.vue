<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import SearchValueWithOperator from '~~/app/components/cards/search/shared/SearchValueWithOperator.vue'
import { 
  defaultNumericCondition,
  createNumericCondition,
} from '~/utils/search/cardSearchFormFactory'
import {
  isChangedNumericCondition,
} from '~/utils/search/cardSearchChanged'
import type { SearchForm } from '~~/app/types/ui/search'
import { ADDITIONAL_COMBAT_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedNumericCondition(
    model.value.additionalDefense,
    defaultNumericCondition,
  )
})
const resetAll = () => {
  model.value.additionalDefense = createNumericCondition()
}
</script>
<template>
  <SearchRow
    label="防御力"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
  <SearchValueWithOperator
    v-model="model.additionalDefense.value"
    v-model:operator="model.additionalDefense.operator"
    :items="ADDITIONAL_COMBAT_OPTIONS"
  />
  </SearchRow>
</template>
