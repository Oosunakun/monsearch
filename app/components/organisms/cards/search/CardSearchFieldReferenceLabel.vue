<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'

import { useDisplay } from 'vuetify'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition
} from '~/utils/search/cardSearchFormFactory'
import type { SearchForm } from '~~/app/types/ui/search'

const { mobile } = useDisplay()

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.referenceLabel.length > 0
})
const resetAll = () => {
  model.value.referenceLabel = ""
}
</script>
<template>
  <CardSearchRow
    label="カードNo/整理番号"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <v-text-field
      v-model="model.referenceLabel"
      density="compact"
      variant="outlined"
      hide-details
      flat
      class="rounded mb-3"
      placeholder="カードNo/整理番号を入力..."
    />
  </CardSearchRow>
</template>