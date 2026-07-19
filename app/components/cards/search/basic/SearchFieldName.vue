<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'

const { mobile } = useDisplay()

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.name.length > 0
})
const resetAll = () => {
  model.value.name = ""
}
</script>
<template>
  <SearchRow
    label="カード名"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <v-text-field
      v-model="model.name"
      density="compact"
      variant="outlined"
      hide-details
      flat
      class="rounded mb-3"
      placeholder="カード名を入力..."
    />
  </SearchRow>
</template>