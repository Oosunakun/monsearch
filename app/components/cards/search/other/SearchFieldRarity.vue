<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'
import { RARITY_OPTIONS } from '~~/app/utils/constants/search/options'
import HexagramIcon from '~~/app/components/common/icons/HexagramIcon.vue'
import CrescentIcon from '~~/app/components/common/icons/CrescentIcon.vue'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.rarities.length > 0
})
const resetAll = () => {
  model.value.rarities = []
}
</script>
<template>
  <SearchRow
    label="出現頻度"
    :class="{
      'mb-1': !mobile,
      'mb-2':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <div class="d-flex flex-wrap item-grid">
      <v-checkbox
        v-for="opt in RARITY_OPTIONS"
        :key="opt.value"
        v-model="model.rarities"
        :value="opt.value"
        hide-details
        density="compact"
        color="#8bc34aCC"
        :class="{'mt-n2': mobile}"
      >
        <template #label>
          <span class="label" style="font-size: 0.9rem;">
            <HexagramIcon v-if="opt.value === 'hexagram'"/>
            <CrescentIcon v-else-if="opt.value === 'crescent'"/>
            <v-icon v-else :icon="opt.label"/>
          </span>
        </template>
      </v-checkbox>
    </div>
  </SearchRow>
</template>
<style scoped>
.item-grid {
  gap: 2px 12px;
}

.label {
  color: #D50000;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

.crescent-icon {
  transform: scaleX(-1) rotate(-30deg); /* 左右反転し、20度回転 */
}
</style>