<script setup lang="ts">
import type { RaceTypeSearchForm } from '~~/app/types/ui/search'

const props = defineProps<{
  modelValue: RaceTypeSearchForm
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RaceTypeSearchForm]
}>()

const updateField = <K extends keyof RaceTypeSearchForm>(key: K, value: RaceTypeSearchForm[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}
</script>

<template>
  <v-card variant="outlined">
    <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
      種族・タイプ
    </v-sheet>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="modelValue.raceKeyword"
            label="種族"
            placeholder="例: ドラゴン"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('raceKeyword', String($event ?? ''))"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            :model-value="modelValue.cardTypeKeyword"
            label="カードタイプ"
            placeholder="例: 英雄点持ちユニット"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('cardTypeKeyword', String($event ?? ''))"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
