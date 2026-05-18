<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition
} from '~/utils/search/cardSearchFormFactory'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'

const { mobile } = useDisplay()

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.effectText.length > 0
})
const resetAll = () => {
  model.value.effectText = ""
}
</script>
<template>
  <CardSearchRow
    label="カードテキスト"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <v-text-field
      v-model="model.effectText"
      density="compact"
      variant="outlined"
      hide-details
      flat
      class="rounded mb-3"
      placeholder="カードテキストを入力..."
    />
  </CardSearchRow>
</template>