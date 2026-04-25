<script setup lang="ts">
import type { QuickSearchOption, QuickSearchState } from '~~/app/types/ui/layout'
import { UI_COLORS } from '~~/app/utils/constants/colors'

const props = defineProps<{
  modelValue: QuickSearchState
  cardPools: QuickSearchOption[]
  searchTypes: QuickSearchOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: QuickSearchState]
  submit: []
}>()

const updateField = <K extends keyof QuickSearchState>(key: K, value: QuickSearchState[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <v-form
    class="d-flex flex-wrap align-center ga-2 header-search-form"
    :style="{
      '--quick-search-text-color': UI_COLORS.HEADING_BROWN,
      '--quick-search-active-text-color': UI_COLORS.WHITE
    }"
    @submit.prevent="emit('submit')"
  >
    <v-select
      :model-value="modelValue.selectedCardPool"
      :items="cardPools"
      item-title="title"
      item-value="value"
      variant="outlined"
      density="compact"
      hide-details
      class="layout-search-field"
      aria-label="カードプール選択"
      @update:model-value="updateField('selectedCardPool', String($event ?? ''))"
    />
    <v-btn-toggle
      :model-value="modelValue.selectedSearchType"
      mandatory
      divided
      class="search-type-toggle"
      @update:model-value="updateField('selectedSearchType', String($event ?? ''))"
    >
      <v-btn
        v-for="type in searchTypes"
        :key="type.value"
        :value="type.value"
        size="small"
        class="text-caption font-weight-bold"
      >
        {{ type.title }}
      </v-btn>
    </v-btn-toggle>
    <v-text-field
      :model-value="modelValue.searchText"
      placeholder="例: ドラゴン"
      variant="outlined"
      density="compact"
      hide-details
      class="layout-search-text"
      aria-label="検索ワード入力"
      @update:model-value="updateField('searchText', String($event ?? ''))"
    />
    <v-btn color="primary" type="submit" class="layout-search-button">
      検索
    </v-btn>
  </v-form>
</template>

<style scoped>
.layout-search-field {
  min-width: 150px;
  max-width: 180px;
}

.layout-search-text {
  min-width: 190px;
  max-width: 220px;
}

.layout-search-button {
  min-width: 84px;
  height: 40px;
}

.header-search-form :deep(.v-field) {
  border-radius: 6px;
}

.search-type-toggle {
  background: #f2f8e8;
  border-radius: 6px;
  padding: 2px;
}

.search-type-toggle :deep(.v-btn) {
  text-transform: none;
  min-width: 74px;
  color: var(--quick-search-text-color);
}

.search-type-toggle :deep(.v-btn--active) {
  background: rgb(var(--v-theme-primary));
  color: var(--quick-search-active-text-color);
}

@media (max-width: 959px) {
  .header-search-form {
    width: 100%;
  }

  .layout-search-field,
  .layout-search-text {
    min-width: 100%;
    max-width: 100%;
  }

  .search-type-toggle {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .search-type-toggle :deep(.v-btn) {
    width: 100%;
  }
}
</style>
