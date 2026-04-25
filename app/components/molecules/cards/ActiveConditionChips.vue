<script setup lang="ts">
import type { SearchCondition } from '~~/app/types/ui/cards'

defineProps<{
  conditions: SearchCondition[]
}>()

const emit = defineEmits<{
  clear: []
}>()
</script>

<template>
  <v-sheet
    color="secondary"
    class="d-flex flex-wrap align-center justify-space-between ga-3 pa-3 mb-4"
    border
    rounded
  >
    <div class="d-flex flex-wrap ga-2">
      <v-chip
        v-for="condition in conditions"
        :key="condition.id"
        color="accent-light"
        text-color="accent"
        variant="flat"
        size="small"
      >
        {{ condition.label }}
      </v-chip>
    </div>
    <v-btn color="grey-darken-1" variant="flat" size="small" @click="emit('clear')">
      条件をクリア
    </v-btn>
  </v-sheet>
</template>
