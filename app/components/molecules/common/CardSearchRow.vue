<script setup lang="ts">
const props = defineProps<{
  label: string
  enableReset?: boolean
}>()

const emit = defineEmits<{
  (e: 'reset'): void
}>()
</script>
<template>
  <v-row no-gutters class="mb-0 mt-0">
    <v-col cols="12" md="2" class="px-2 pb-md-0 pb-1 d-flex align-start">
      <div class="d-flex align-center justify-space-between w-100 mt-2">
        <label class="text-subtitle-2 text-md-left d-block">
          {{ label }}
        </label>
        <v-btn
          icon="mdi-close"
          variant="tonal"
          density="compact"
          size="small"
          :color="enableReset ? 'error' : 'grey-darken-1'"
          :disabled="!enableReset"
          @click="emit('reset')"
        />
      </div>
    </v-col>
    <v-col cols="12" md="7" class="px-2">
      <slot></slot>
    </v-col>
  </v-row>
</template>