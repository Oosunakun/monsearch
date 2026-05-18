<script setup lang="ts">
import SearchValueWithOperator from '~~/app/components/molecules/common/SearchValueWithOperator.vue'
import { useDisplay } from 'vuetify'
import type { NumericOption } from '~~/app/types/ui/searchOption'
import type { SearchOption } from '~~/app/types/ui/searchOption'
import { SEARCH_FILTER_OPTIONS, SEARCH_FILTER } from '~~/app/utils/constants/search/conditions'
import type { SearchOperator, SearchFilter } from '~~/app/utils/constants/search/conditions'

const props = withDefaults(
  defineProps<{
  items: readonly NumericOption[]
  options?: readonly SearchOption[]
  alwaysShowValue?: boolean
}>(), {
  options: () => SEARCH_FILTER_OPTIONS,
  alwaysShowValue: false,
})

// 各ステートを個別に defineModel で定義することで、親のどのプロパティともバインド可能にします
const filterType = defineModel<SearchFilter>('filterType', { required: true })
const scoreValue = defineModel<number | null>('value', { default: null })
const operator = defineModel<SearchOperator>('operator', { required: true })
</script>

<template>
  <v-btn-toggle
    v-model="filterType"
    mandatory
    variant="outlined"
    density="compact"
    color="primary"
    class="operator-toggle mt-1 mb-2"
    divided
  >
    <v-btn 
      v-for="opt in options"
      :key="opt.value" 
      :value="opt.value"
      class="px-3 text-body-2"
    >
      {{ opt.label }}
    </v-btn>
  </v-btn-toggle>

  <SearchValueWithOperator 
    v-if="props.alwaysShowValue || filterType === SEARCH_FILTER.INCLUDE.value"
    v-model="scoreValue"
    v-model:operator="operator"
    :items="props.items"
  />
</template>

<style scoped>
.operator-toggle {
  border-radius: 4px;
  height: 32px !important;
}
</style>