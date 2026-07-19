<script setup lang="ts">
import { useDisplay } from 'vuetify'

const { thresholds } = useDisplay()

const props = withDefaults(
  defineProps<{
    maxWidth?: string
  }>(),
  {
    maxWidth: undefined
  }
)

const defaultMaxWidth = `${thresholds.value.lg}px`
const actualMaxWidth = computed(() => props.maxWidth ?? defaultMaxWidth)
</script>

<template>
  <v-container
    class="mx-auto pa-0"
    :style="{ maxWidth: actualMaxWidth }"
    fluid
  >
    <slot></slot>
  </v-container>
</template>
