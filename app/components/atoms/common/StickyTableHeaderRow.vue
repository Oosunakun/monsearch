<script setup lang="ts">
import { UI_COLORS } from '~~/app/utils/constants/colors'

withDefaults(
  defineProps<{
    theme?: 'primary' | 'secondary'
    headerBackground?: string
    textColor?: string
  }>(),
  {
    theme: 'secondary',
    headerBackground: '',
    textColor: ''
  }
)
</script>

<template>
  <div
    class="sticky-table-header-row"
    :class="`sticky-table-header-row--${theme}`"
    :style="{
      '--sticky-header-bg': headerBackground || (theme === 'primary' ? UI_COLORS.PRIMARY : UI_COLORS.SECONDARY),
      '--sticky-header-text-color': textColor || 'inherit'
    }"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.sticky-table-header-row :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  font-weight: 700;
  background: var(--sticky-header-bg);
  color: var(--sticky-header-text-color);
}
</style>
