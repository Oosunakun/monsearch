<script setup lang="ts">
withDefaults(
  defineProps<{
    maxWidth?: string
  }>(),
  {
    maxWidth: '1360px'
  }
)
</script>

<template>
  <v-container class="mx-auto" :style="{ maxWidth }">
    <slot />
  </v-container>
</template>
