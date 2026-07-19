<script setup lang="ts">
defineProps<{
  fill: string
}>()
</script>
<template>
  <svg viewBox="0 0 64 64">
    <!-- 外枠 -->
    <rect
      x="2"
      y="2"
      width="60"
      height="60"
      rx="2"
      :fill="fill"
      stroke="#bfa7a7"
      stroke-width="2"
    />

    <!-- ハイライト -->
    <polyline
      points="2,62 2,2 62,2"
      fill="none"
      stroke="#ffffff"
      stroke-width="2.5"
      opacity="0.9"
    />

    <!-- シャドウ -->
    <polyline
      points="62,2 62,62 2,62"
      fill="none"
      stroke="#606060"
      stroke-width="2.5"
      opacity="0.9"
    />
  </svg>
</template>
<style scoped>

</style>