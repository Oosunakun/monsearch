<script setup lang="ts">
import SearchRow from '~~/app/components/cards/search/shared/SearchRow.vue'
import { useDisplay } from 'vuetify'
import type { SearchForm } from '~~/app/types/ui/search'
import { CARD_CATEGORY_OPTIONS } from '~~/app/utils/constants/search/options'

const { mobile } = useDisplay()

const model = defineModel<SearchForm>({ required: true })

const enableReset = computed(() => {
  return model.value.cardCategory.length > 0
})
const resetAll = () => {
  model.value.cardCategory = ""
}
</script>
<template>
  <SearchRow
    label="カード分類"
    :class="{
      'mb-1': !mobile,
      'mb-2':  mobile
    }"
    :enable-reset="enableReset"
    @reset="resetAll"
  >
   <v-chip-group
      v-model="model.cardCategory"
      column
      mandatory
      color="primary"
      class="mt-1 mb-2"
    >
      <v-chip
        v-for="opt in CARD_CATEGORY_OPTIONS"
        :key="opt.value"
        :value="opt.value"
        variant="outlined"
        size="small"
        class="px-3 border-thin"
      >
        <span class="accent-line mr-1" :class="`bg-${opt.color}`"></span>
        {{ opt.label }}
      </v-chip>
      <div
        class="text-caption text-grey-darken-1 w-100 mt-1"
        style="font-size: 0.8rem;"
      >
        ※カード分類により表示項目が変わります。
      </div>
    </v-chip-group>

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
  height: 14px;
  border-radius: 2px;
  transform-origin: center;
  margin-left:2px;
  margin-right:2px;
  transform: rotate(15deg);
}
.operator-toggle {
  border-radius: 4px;
  height: 32px !important;
}
:deep(.v-chip--selected) {
  /* 1. 太字化を防止（現状の指定を維持） */
  font-weight: inherit !important; 
  
  /* 2. 背景をレベルトグルと同じ「薄い黄緑」にする */
  background-color: #f1f8e9 !important; /* Vuetifyの green-lighten-5 相当（お好みで#f5fafd等に調整可） */
  
  /* 3. 枠線をレベルトグルと同じ「黄緑色 ＋ ほんの少し太く（1.5px〜2px）」する */
  border-color: #8bc34a !important;     /* レベルの枠線と同じ色。 mandatory の青を上書き */
  border-width: 1.5px !important;       /* 線の存在感をトグルに合わせる */
  
  /* 4. 文字色も枠線と同系の濃い緑にして馴染ませる */
  color: #558b2f !important;            /* green-darken-3 相当で視認性を確保 */
}
</style>