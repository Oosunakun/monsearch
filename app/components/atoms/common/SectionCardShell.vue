<script setup lang="ts">
withDefaults(
  defineProps<{
    marginBottom?: boolean
    contentClass?: string
  }>(),
  {
    marginBottom: true,
    contentClass: ''
  }
)
</script>

<template>
  <v-card variant="tonal" :class="{ 'mb-3': marginBottom }">
    <v-card-text :class="contentClass">
      <slot></slot>
    </v-card-text>
  </v-card>
</template>
