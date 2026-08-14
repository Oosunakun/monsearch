<script setup lang="ts">
import { useDisplay } from 'vuetify'
import ResultDisplaySettingsMobile from '~~/app/components/cards/result/controls/ResultDisplaySettingsMobile.vue'
import ResultDisplaySettingsDesktop from '~~/app/components/cards/result/controls/ResultDisplaySettingsDesktop.vue'
import type { ResultSortOptionItem, ResultSortOrderItem, ResultLimitOptionItem } from '~~/app/types/ui/result'

const { mobile } = useDisplay()

defineProps<{
  sortOptions: ResultSortOptionItem[]
  sortOrders: ResultSortOrderItem[]
  limitOptions: ResultLimitOptionItem[]
}>()

const sortItem = defineModel<string>('sortItem',{ required: true })
const sortOrder = defineModel<string>('sortOrder',{ required: true })
const limitPerPage = defineModel<number>('limitPerPage',{ required: true })
</script>
<template>
  <ResultDisplaySettingsMobile
      v-if="mobile"
      v-model:sort-item="sortItem"
      v-model:sort-order="sortOrder"
      v-model:limit-per-page="limitPerPage"
      :sort-options="sortOptions"
      :sort-orders="sortOrders"
      :limit-options="limitOptions"
  />
  <ResultDisplaySettingsDesktop
      v-else
      v-model:sort-item="sortItem"
      v-model:sort-order="sortOrder"
      v-model:limit-per-page="limitPerPage"
      :sort-options="sortOptions"
      :sort-orders="sortOrders"
      :limit-options="limitOptions"
  />
</template>