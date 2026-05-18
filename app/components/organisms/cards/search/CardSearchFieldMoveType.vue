<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import { useDisplay } from 'vuetify'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition
} from '~/utils/search/cardSearchFormFactory'
import type { SearchForm } from '~~/app/types/ui/search'
import { MOVE_TYPE_OPTIONS } from '~~/app/utils/constants/search/options'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.moveTypes.length > 0
})
const resetAll = () => {
  model.value.moveTypes = []
}
</script>
<template>
  <CardSearchRow
    label="進軍タイプ"
    :class="{
      'mb-1': !mobile,
      'mb-2':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <div class="d-flex flex-wrap item-grid">
      <v-checkbox
        v-for="opt in MOVE_TYPE_OPTIONS"
        :key="opt.value"
        :value="opt.value"
        v-model="model.moveTypes"
        hide-details
        density="compact"
        color="#8bc34aCC" 
        :class="{'mt-n2': mobile}"
      >
        <template #label>
          <span class="label">
            {{ opt.label }}
          </span>
        </template>
      </v-checkbox>
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

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.15);
  margin-top: 2px;
}
</style>