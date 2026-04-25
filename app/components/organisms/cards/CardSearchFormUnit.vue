<script setup lang="ts">
import type { ElementOption, SelectOption, UnitSearchForm } from '~~/app/types/ui/search'

const props = defineProps<{
  modelValue: UnitSearchForm
  moveTypeOptions: SelectOption[]
  elementOptions: ElementOption[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: UnitSearchForm]
}>()

const toNullableNumber = (value: unknown): number | null => {
  if (value === '' || value == null) {
    return null
  }

  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

const updateField = <K extends keyof UnitSearchForm>(key: K, value: UnitSearchForm[K]) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: value
  })
}

const toggleElement = (value: string) => {
  const selected = props.modelValue.selectedElements
  const next = selected.includes(value)
    ? selected.filter((entry) => entry !== value)
    : [...selected, value]

  updateField('selectedElements', next)
}
</script>

<template>
  <v-card variant="outlined">
    <v-sheet color="secondary" class="px-4 py-2 text-subtitle-2 font-weight-bold">
      ユニット情報
    </v-sheet>
    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="4">
          <div class="d-flex ga-2">
            <v-text-field
              :model-value="modelValue.levelFrom"
              label="レベル From"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateField('levelFrom', toNullableNumber($event))"
            />
            <v-text-field
              :model-value="modelValue.levelTo"
              label="To"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateField('levelTo', toNullableNumber($event))"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex ga-2">
            <v-text-field
              :model-value="modelValue.attackFrom"
              label="攻撃力 From"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateField('attackFrom', toNullableNumber($event))"
            />
            <v-text-field
              :model-value="modelValue.attackTo"
              label="To"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateField('attackTo', toNullableNumber($event))"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <div class="d-flex ga-2">
            <v-text-field
              :model-value="modelValue.defenseFrom"
              label="防御力 From"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateField('defenseFrom', toNullableNumber($event))"
            />
            <v-text-field
              :model-value="modelValue.defenseTo"
              label="To"
              type="number"
              variant="outlined"
              density="comfortable"
              hide-details
              @update:model-value="updateField('defenseTo', toNullableNumber($event))"
            />
          </div>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            :model-value="modelValue.selectedMoveType"
            :items="moveTypeOptions"
            item-title="title"
            item-value="value"
            label="移動タイプ"
            variant="outlined"
            density="comfortable"
            hide-details
            @update:model-value="updateField('selectedMoveType', String($event ?? ''))"
          />
        </v-col>
      </v-row>
      <p class="text-caption font-weight-bold mt-4 mb-2">
        属性（複数選択）
      </p>
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="element in elementOptions"
          :key="element.value"
          :color="element.color"
          :variant="modelValue.selectedElements.includes(element.value) ? 'flat' : 'outlined'"
          :prepend-icon="modelValue.selectedElements.includes(element.value) ? 'mdi-check' : undefined"
          @click="toggleElement(element.value)"
        >
          {{ element.label }}
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>
