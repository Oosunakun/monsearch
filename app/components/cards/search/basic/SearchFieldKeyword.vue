<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { useDisplay } from 'vuetify'
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
  <SearchRow
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
  </SearchRow>
</template>