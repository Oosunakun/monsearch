<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { handleSearchEnter } from '~~/app/utils/search/handleSearchEnter'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'

const { mobile } = useDisplay()

// 親から渡されたモデルを各フィールドに分配する
const model = defineModel<SearchForm>({ required: true })
const emit = defineEmits<{ submit: [] }>()

const enableReset = computed(() => {
  return model.value.referenceLabel.length > 0
})
const resetAll = () => {
  model.value.referenceLabel = ""
}
</script>
<template>
  <SearchRow
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
      @keydown.enter="handleSearchEnter($event, () => emit('submit'))"
    />
  </SearchRow>
</template>