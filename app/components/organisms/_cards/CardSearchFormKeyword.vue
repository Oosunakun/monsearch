<script setup lang="ts">
import type { KeywordSearchForm } from '~/types/ui/_search'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'

const props = defineProps<{
  modelValue: KeywordSearchForm
}>()

const emit = defineEmits<{
  'update:modelValue': [value: KeywordSearchForm]
}>()
</script>

<template>
  <v-card variant="outlined">
    <AppSectionHeader title="キーワード" />
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
