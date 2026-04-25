<script setup lang="ts">
defineProps<{
  label: string
  value: string
  color: string
  selected: boolean
}>()

const emit = defineEmits<{
  toggle: [value: string]
}>()
</script>

<template>
  <v-chip
    :color="color"
    :variant="selected ? 'flat' : 'outlined'"
    :prepend-icon="selected ? 'mdi-check' : undefined"
    @click="emit('toggle', value)"
  >
    {{ label }}
  </v-chip>
</template>
