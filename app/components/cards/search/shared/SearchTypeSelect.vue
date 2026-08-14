<script setup lang="ts">
import type { QuickSearchOption } from '~~/app/types/ui/layout'

defineProps<{
  modelValue: string
  items: QuickSearchOption[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <v-select
    :model-value="modelValue"
    :items="items"
    item-title="title"
    item-value="value"
    variant="plain"
    density="compact"
    hide-details
    class="search-type-select"
    @update:model-value="$emit('update:modelValue', String($event ?? ''))"
  />
</template>

<style scoped>
.search-type-select {
  min-width: 110px;
  max-width: 150px;
  font-size: 0.8rem;
}
.search-type-select :deep(.v-field__input) {
  padding: 0;
  min-height: unset;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
}
.search-type-select :deep(.v-field__append-inner) {
  padding-top: 0;
}
</style>
