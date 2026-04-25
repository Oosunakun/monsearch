<script setup lang="ts">
withDefaults(
  defineProps<{
    theme?: 'primary' | 'secondary'
    textColor?: string
  }>(),
  {
    theme: 'secondary',
    textColor: ''
  }
)
</script>

<template>
  <div
    class="sticky-table-header-row"
    :class="`sticky-table-header-row--${theme}`"
    :style="textColor ? { '--sticky-header-text-color': textColor } : undefined"
  >
    <slot />
  </div>
</template>

<style scoped>
.sticky-table-header-row :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  font-weight: 700;
  color: var(--sticky-header-text-color, inherit);
}

.sticky-table-header-row--primary :deep(thead th) {
  background: rgb(var(--v-theme-primary));
}

.sticky-table-header-row--secondary :deep(thead th) {
  background: rgb(var(--v-theme-secondary));
}
</style>
