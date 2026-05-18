<script setup lang="ts">
import CardSearchRow from '~~/app/components/molecules/common/CardSearchRow.vue'
import { useDisplay } from 'vuetify'
import { 
  defaultNumericCondition,
  defaultFilteredNumericCondition,
  defaultSlotCondition
} from '~/utils/search/cardSearchFormFactory'
import type { SearchForm } from '~~/app/types/ui/search'
import { LAND_CATEGORY_OPTIONS } from '~~/app/utils/constants/search/options'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.landCategory !== "all"
})
const resetAll = () => {
  model.value.landCategory = "all"
}
</script>
<template>
  <CardSearchRow
    label="地形分類"
    :class="{
      'mt-3': !mobile,
      'mt-1':  mobile,
      'mb-2': true,
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
    <v-btn-toggle
      v-model="model.landCategory"
      mandatory
      variant="outlined"
      density="compact"
      color="primary"
      class="operator-toggle mt-1 mb-2"
      divided
    >
      <v-btn 
        v-for="opt in LAND_CATEGORY_OPTIONS"
        :key="opt.value" 
        :value="opt.value"
        class="px-3 text-body-2"
      >
        {{ opt.label }}
      </v-btn>
    </v-btn-toggle>
  </CardSearchRow>
</template>
<style scoped>
.operator-toggle {
  border-radius: 4px;
  height: 32px !important;
}
</style>