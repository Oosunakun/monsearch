<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    color?: string
    textClass?: string
  }>(),
  {
    color: 'secondary',
    textClass: ''
  }
)
</script>

<template>
  <v-sheet :color="color" class="px-4 py-2 text-subtitle-2 font-weight-bold" :class="textClass">
    {{ title }}
  </v-sheet>
</template>
