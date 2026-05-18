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

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.keyword.length > 0
})
const resetAll = () => {
  model.value.keyword = ""
}
</script>
<template>
  <CardSearchRow
    label="キーワード"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <v-text-field
      v-model="model.keyword"
      density="compact"
      variant="outlined"
      hide-details
      flat
      class="rounded mb-3"
      placeholder="カード名を入力..."
    />
  </CardSearchRow>
</template>