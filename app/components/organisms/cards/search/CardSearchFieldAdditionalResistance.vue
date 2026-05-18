<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import SearchCheckboxSelector from '~~/app/components/molecules/common/SearchCheckboxSelector.vue'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition
} from '~/utils/search/cardSearchFormFactory'
import type { SearchForm } from '~~/app/types/ui/search'
import { RESISTANCE_OPTIONS } from '~~/app/utils/constants/search/options'
import { useDisplay } from 'vuetify'
const model = defineModel<SearchForm>({ required: true })

const { mobile } = useDisplay()

const enableReset = computed(() => {
  return model.value.additionalResistances.length > 0
})
const resetAll = () => {
  model.value.additionalResistances = []
}
</script>
<template>
  <CardSearchRow
    label="耐性"
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
        v-model="model.additionalResistances"
        label="耐性を選択"
        :items="RESISTANCE_OPTIONS"
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