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
    <v-sheet 
      :color="color"
      class="px-3 py-1 text-subtitle-1 font-weight-bold"
      :class="textClass"
      style="font-size: large;"
    >
    {{ title }}
  </v-sheet>
</template>
