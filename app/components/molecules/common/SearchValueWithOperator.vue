<script setup lang="ts">
import type { SearchOperator } from '~~/app/utils/constants/search/conditions'
import { SEARCH_OPERATOR_OPTIONS } from '~~/app/utils/constants/search/conditions'
import type { NumericOption, SearchOption } from '~~/app/types/ui/searchOption'

const props = withDefaults(
  defineProps<{
    items: readonly NumericOption[]
    options?: readonly SearchOption[]
    colsMobile?: number
    colorPreset?: string
  }>(),
  {
    options: () => SEARCH_OPERATOR_OPTIONS,
    colsMobile: 6,
    colorPreset: undefined
  }
)

const scoreValue = defineModel<number | null>({ default: null })
const operator = defineModel<SearchOperator>('operator', { required: true })
</script>

<template>
  <div class="search-value-operator-container w-100">
    <div class="d-flex align-center gap-2 mb-2">
      <v-btn-toggle
        v-model="operator"
        mandatory
        variant="outlined"
        density="compact"
        color="primary"
        class="operator-toggle"
        divided
      >
        <v-btn 
          v-for="opt in options"
          :key="opt.value" 
          :value="opt.value"
          class="px-3 text-body-2"
        >
          {{ opt.label }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <div class="custom-numeric-container" :style="{ '--cols-mobile': props.colsMobile }">
      <template v-for="opt in items" :key="opt.value">
        <v-btn
          variant="outlined"
          density="compact"
          :color="scoreValue === opt.value ? 'primary' : 'grey-lighten-1'"
          class="custom-numeric-btn"
          :class="{ 
            'btn-active': scoreValue === opt.value,
            'has-gap-after': opt.gapAfter,
            'preset-red': scoreValue !== opt.value && opt.colorPreset === 'red',
            'preset-blue': scoreValue !== opt.value && opt.colorPreset === 'blue'
          }"
          @click="scoreValue = scoreValue === opt.value ? null : opt.value"
        >
          {{ opt.label }}
        </v-btn>

        <div v-if="opt.lineBreakAfter" class="flex-break" />
      </template>
    </div>
  </div>
</template>

<style scoped>
.gap-2 {
  gap: 8px;
}

.operator-toggle {
  border-radius: 4px;
  height: 32px !important;
}

.custom-numeric-container {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 6px; /* ボタン間の隙間 */
}

.custom-numeric-btn {
  flex: 1 0 calc((100% / var(--cols-mobile)) - 6px) !important;
  max-width: calc((100% / var(--cols-mobile)) - 6px) !important;
  
  min-width: 32px !important;
  height: 36px !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  border-radius: 4px !important;
  padding: 0 !important;
  font-size: 14px !important;
  text-transform: none;
  background-color: #ffffff;
}

.btn-active {
  border-color: rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: bold;
}

.flex-break {
  flex-basis: 100%;
  height: 0;
  margin: 0;
  padding: 0;
}

/* ==========================================================================
   ✨ 【新規】呼び出し元（options）の指定に従って適用されるイニシアチブ専用スタイル
   ========================================================================== */
.custom-numeric-btn.preset-red {
  color: #c6282870 !important;
  border-color: rgba(198, 40, 40, 0.15) !important;
  text-shadow: 0 0 20px rgba(239, 83, 80, 0.5);
}

.custom-numeric-btn.preset-blue {
  color: #1565c070 !important;
  border-color: rgba(21, 101, 192, 0.15) !important;
  text-shadow: 0 0 20px rgba(66, 165, 245, 0.5)
}

@media (min-width: 960px) {
  .custom-numeric-btn {
    flex: 0 0 auto !important;
    max-width: 44px !important;
    width: 44px !important;
  }
  .custom-numeric-btn.has-gap-after {
    margin-right: 12px;
  }
}

</style>