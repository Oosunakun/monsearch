<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import SearchValueWithOperator from '~~/app/components/molecules/common/SearchValueWithOperator.vue'
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
import { HERO_POINT_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedFilteredNumericCondition(
    model.value.heroPoint,
    defaultFilteredNumericCondition,
  )
})
const resetAll = () => {
  model.value.heroPoint = createFilteredNumericCondition()
}
</script>
<template>
  <CardSearchRow
    label="英雄/英雄点"
    :class="{
      'mt-3': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
  <SearchFilterWithOperator 
    v-model:filterType="model.heroPoint.filterType"
    v-model:value="model.heroPoint.value"
    v-model:operator="model.heroPoint.operator"
    :items="HERO_POINT_OPTIONS"
  />
  </CardSearchRow>
</template>
<style scoped>
.operator-toggle {
  border-radius: 4px;
  height: 32px !important;
}
</style>