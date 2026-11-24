<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'
import { handleSearchEnter } from '~~/app/utils/search/handleSearchEnter'

const { mobile } = useDisplay()
const model = defineModel<SearchForm>({ required: true })
const emit = defineEmits<{ submit: [] }>()

const enableReset = computed(() => {
  return model.value.archetypeText.length > 0
})
const resetAll = () => {
  model.value.archetypeText = ''
}
</script>
<template>
  <SearchRow
    label="種族・タイプ"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <v-text-field
      v-model="model.archetypeText"
      density="compact"
      variant="outlined"
      hide-details
      flat
      aria-label="種族・タイプ"
      placeholder="種族・タイプを入力..."
      class="rounded mb-3"
      @keydown.enter="handleSearchEnter($event, () => emit('submit'))"
    />
  </SearchRow>
</template>
