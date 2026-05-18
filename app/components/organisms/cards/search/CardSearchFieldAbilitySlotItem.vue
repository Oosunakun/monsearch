<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import SearchSlotSelector from '~~/app/components/molecules/common/SearchSlotSelector.vue'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition,
  createNumericCondition,
  createFilteredNumericCondition,
  createSlotCondition,
} from '~/utils/search/cardSearchFormFactory'
import {
  isChangedNumericCondition,
  isChangedFilteredNumericCondition,
  isChangedSlotCondition,
} from '~/utils/search/cardSearchChanged'
import type { SearchForm } from '~~/app/types/ui/search'
import { ITEM_SLOT_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return isChangedSlotCondition(
    model.value.abilityItemSlots,
    defaultSlotCondition,
  )
})
const resetAll = () => {
  model.value.abilityItemSlots = createSlotCondition()
}
</script>
<template>
  <CardSearchRow
    label="アイテム枠"
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
        label="アイテム枠を選択"
        :items="ITEM_SLOT_OPTIONS"
        :max-count="4"
        v-model="model.abilityItemSlots.slots"
        v-model:match="model.abilityItemSlots.match"
      />
    </div>
  </CardSearchRow>
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