<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import SearchSlotSelector from '~~/app/components/cards/search/shared/SearchSlotSelector.vue'
import { 
  defaultSlotCondition,
  createSlotCondition,
} from '~/utils/search/cardSearchFormFactory'
import {
  isChangedSlotCondition,
} from '~/utils/search/cardSearchChanged'
import type { SearchForm } from '~~/app/types/ui/search'
import { OTHER_SLOT_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedSlotCondition(
    model.value.costOtherEntities,
    defaultSlotCondition,
  )
})
const resetAll = () => {
  model.value.costOtherEntities = createSlotCondition()
}
</script>
<template>
  <SearchRow
    label="コスト（その他）"
    :class="{
      'mt-4': !mobile,
      'mt-1':  mobile,
      'mb-4': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <div class="d-flex flex-wrap item-grid">
      <SearchSlotSelector
        v-model:slots="model.costOtherEntities.slots"
        v-model:match="model.costOtherEntities.match"
        :items="OTHER_SLOT_OPTIONS"
        :max-count="4"
        label="その他の選択"
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
