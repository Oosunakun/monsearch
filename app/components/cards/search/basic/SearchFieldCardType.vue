<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import SearchCheckboxSelector from '~~/app/components/cards/search/shared/SearchCheckboxSelector.vue'
import type { SearchForm } from '~~/app/types/ui/search'
import { CARD_TYPE_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'
const model = defineModel<SearchForm>({ required: true })

const { mobile } = useDisplay()

const enableReset = computed(() => {
  return model.value.cardTypes.length > 0
})
const resetAll = () => {
  model.value.cardTypes = []
}
</script>
<template>
  <SearchRow
    label="タイプ"
    :class="{
      'mt-4': !mobile,
      'mt-0': mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <div class="d-flex flex-wrap item-grid">
      <SearchCheckboxSelector
        v-model="model.cardTypes"
        label="タイプ"
        :items="CARD_TYPE_OPTIONS"
      />
    </div>
  </SearchRow>
</template>
<style scoped>
.item-grid {
  gap: 2px 12px;
}

.label {
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.accent-line {
  display: inline-block;
  width: 4px;
  height: 18px;
  border-radius: 2px;
  transform-origin: center;
  margin-left:2px;
  margin-right:2px;
  transform: rotate(15deg);
}
</style>