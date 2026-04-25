<script setup lang="ts">
import type { BasicSearchForm, SelectOption } from '~~/app/types/ui/search'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'

const props = defineProps<{
  modelValue: BasicSearchForm
  categoryOptions: SelectOption[]
  rarityOptions: SelectOption[]
  cardPoolOptions: SelectOption[]
  setOptions: SelectOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: BasicSearchForm]
}>()

const updateField = <K extends keyof BasicSearchForm>(key: K, value: BasicSearchForm[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <v-card variant="outlined">
    <AppSectionHeader title="基本情報" />
    <v-card-text>
      <v-row dense>
        <v-col cols="12" lg="8">
          <v-text-field
            :model-value="modelValue.cardName"
            label="カード名"
            placeholder="例: ドラゴンナイト"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('cardName', String($event ?? ''))"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-select
            :model-value="modelValue.selectedCategory"
            :items="categoryOptions"
            item-title="title"
            item-value="value"
            label="カテゴリ"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('selectedCategory', String($event ?? ''))"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-select
            :model-value="modelValue.selectedRarity"
            :items="rarityOptions"
            item-title="title"
            item-value="value"
            label="レアリティ"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('selectedRarity', String($event ?? ''))"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-select
            :model-value="modelValue.selectedCardPool"
            :items="cardPoolOptions"
            item-title="title"
            item-value="value"
            label="カードプール"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('selectedCardPool', String($event ?? ''))"
          />
        </v-col>
        <v-col cols="12" lg="4">
          <v-select
            :model-value="modelValue.selectedSet"
            :items="setOptions"
            item-title="title"
            item-value="value"
            label="セット"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('selectedSet', String($event ?? ''))"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
