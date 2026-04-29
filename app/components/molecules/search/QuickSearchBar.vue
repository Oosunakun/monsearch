<script setup lang="ts">
import type { QuickSearchOption, QuickSearchState } from '~~/app/types/ui/layout'
import SearchTypeSelect from '~~/app/components/atoms/search/SearchTypeSelect.vue'

const props = defineProps<{
  modelValue: QuickSearchState
  cardPools: QuickSearchOption[]
  searchTypes: QuickSearchOption[]
  layout?: 'horizontal' | 'vertical'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: QuickSearchState]
  submit: []
}>()

const isVertical = computed(() => props.layout === 'vertical')

const updateField = <K extends keyof QuickSearchState>(key: K, value: QuickSearchState[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <!-- vertical: モバイルドロワー用・縦並び -->
  <template v-if="isVertical">
    <div class="vertical-search-form">
      <v-select
        :model-value="modelValue.selectedSearchType"
        :items="searchTypes"
        item-title="title"
        item-value="value"
        label="検索対象"
        density="compact"
        variant="outlined"
        hide-details
        style="height: 38px;"
        class="mb-2"
        @update:model-value="updateField('selectedSearchType', String($event ?? ''))"
      />

      <v-text-field
        :model-value="modelValue.searchText"
        placeholder="簡易検索..."
        prepend-inner-icon="mdi-magnify"
        density="compact"
        variant="outlined"
        hide-details
        clearable
        persistent-clear
        style="height: 38px;"
        @update:model-value="updateField('searchText', String($event ?? ''))"
        @keydown.enter="emit('submit')"
      />
    </div>
  </template>

  <!-- horizontal: PCヘッダー用・横並び -->
  <template v-else>
    <v-text-field
      :model-value="modelValue.searchText"
      placeholder="簡易検索..."
      variant="outlined"
      density="compact"
      hide-details
      class="unified-search-field"
      @update:model-value="updateField('searchText', String($event ?? ''))"
      @keydown.enter="emit('submit')"
    >
      <!-- 左側: 検索種別セレクト -->
      <template #prepend-inner>
        <SearchTypeSelect
          :model-value="modelValue.selectedSearchType"
          :items="searchTypes"
          @update:model-value="updateField('selectedSearchType', $event)"
        />
        <v-divider vertical class="mx-1 my-1" />
      </template>
      <!-- 右側: 検索ボタン -->
      <template #append-inner>
        <v-btn
          icon="mdi-magnify"
          variant="text"
          size="small"
          density="compact"
          @click="emit('submit')"
        />
      </template>
    </v-text-field>
  </template>
</template>

<style scoped>
/* horizontal用 */
.unified-search-field {
  min-width: 240px;
  max-width: 520px;
  flex: 1 1 240px;
}
.unified-search-field :deep(.v-field__input) {
  font-size: 0.8rem;
  padding-left: 4px;
}

/* vertical用 */
.vertical-search-form {
  width: 100%;
}
</style>
