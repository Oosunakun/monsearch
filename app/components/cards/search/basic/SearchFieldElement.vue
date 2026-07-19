<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'
import { ELEMENT_OPTIONS } from '~~/app/utils/constants/search/options'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.elements.length > 0
})
const resetAll = () => {
  model.value.elements = []
}
</script>
<template>
  <SearchRow
    label="属性"
    :class="{
      'mb-1': !mobile,
      'mb-2':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <div class="d-flex flex-wrap item-grid">
      <v-checkbox
        v-for="opt in ELEMENT_OPTIONS"
        :key="opt.value"
        v-model="model.elements"
        :value="opt.value"
        hide-details
        density="compact"
        color="#8bc34aCC"
        :class="{'mt-n2': mobile}"
        false-icon="mdi-checkbox-blank-outline"
      >
        <template #label>
          <span class="label">
            <span class="dot" :style="{ backgroundColor: opt.color }"></span>
            {{ opt.label }}
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