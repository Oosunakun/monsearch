<script setup lang="ts">
defineProps<{
  rail: boolean
}>()

</script>

<template>
  <div 
    class="pa-4 text-caption text-medium-emphasis transition-swing"
    :class="{ 'opacity-0': rail }"
    style="white-space: nowrap; overflow: hidden; transition: opacity 0.2s; font-size: 0.75em;"
  >
      &copy; 2026 Monsearch Archive
  </div>
</template>
