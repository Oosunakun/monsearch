<script setup lang="ts">
defineProps<{
  fill: string
}>()
</script>
<template>
  <svg viewBox="0 0 64 64">
    <!-- ○ -->
    <circle
      cx="32"
      cy="17"
      r="8"
      :fill="fill"
    />

    <!-- 四角 -->
    <rect
      x="26"
      y="33"
      width="12"
      height="23"
      :fill="fill"
    />
  </svg>
</template>
<style scoped>
.item-consume-gryph {
  width: 64px;
  height: 64px;
  display: block;
}
</style>