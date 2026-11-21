<script setup lang="ts">
import type { QuickSearchOption, QuickSearchState, QuickSearchTarget } from '~~/app/types/ui/layout'
import SearchTypeSelect from '~~/app/components/cards/search/shared/SearchTypeSelect.vue'
import { handleSearchEnter } from '~~/app/utils/search/handleSearchEnter'

const props = defineProps<{
  modelValue: QuickSearchState
  cardPools: QuickSearchOption[]
  searchTypes: QuickSearchOption<QuickSearchTarget>[]
  layout?: 'horizontal' | 'vertical'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: QuickSearchState]
  submit: []
}>()

const isVertical = computed(() => props.layout === 'vertical')
const searchInputId = useId()

const onSearchEnter = (event: KeyboardEvent) => {
  // VTextField のルートにはスロット内のセレクトやボタンのイベントも届く。
  if (!(event.target instanceof HTMLInputElement) || event.target.id !== searchInputId) return
  handleSearchEnter(event, () => emit('submit'))
}

const updateField = <K extends keyof QuickSearchState>(key: K, value: QuickSearchState[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const updateSearchType = (value: unknown) => {
  if (value === 'name' || value === 'race-type' || value === 'keyword') {
    updateField('selectedSearchType', value)
  }
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
        @update:model-value="updateSearchType"
      />

      <v-text-field
        :id="searchInputId"
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
        @keydown.enter="onSearchEnter"
      />
    </div>
  </template>

  <!-- horizontal: PCヘッダー用・横並び -->
  <template v-else>
    <v-text-field
      :id="searchInputId"
      :model-value="modelValue.searchText"
      placeholder="簡易検索..."
      variant="outlined"
      density="compact"
      hide-details
      class="unified-search-field"
      @update:model-value="updateField('searchText', String($event ?? ''))"
      @keydown.enter="onSearchEnter"
    >
      <!-- 左側: 検索種別セレクト -->
      <template #prepend-inner>
        <SearchTypeSelect
          :model-value="modelValue.selectedSearchType"
          :items="searchTypes"
          @update:model-value="updateSearchType"
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
