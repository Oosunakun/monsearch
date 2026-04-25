<script setup lang="ts">
import type { KeywordSearchForm } from '~~/app/types/ui/search'

const props = defineProps<{
  modelValue: KeywordSearchForm
}>()

const emit = defineEmits<{
  'update:modelValue': [value: KeywordSearchForm]
}>()
</script>

<template>
  <v-card variant="outlined">
    <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
      キーワード
    </v-sheet>
    <v-card-text>
      <v-text-field
        :model-value="modelValue.keyword"
        label="キーワード"
        placeholder="例: 即時召喚"
        variant="outlined"
        density="comfortable"
        hide-details
        @update:model-value="emit('update:modelValue', { ...props.modelValue, keyword: String($event ?? '') })"
      />
    </v-card-text>
  </v-card>
</template>
