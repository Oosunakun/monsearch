<script setup lang="ts">
import SquareIconBase from "~~/app/components/common/icons/SquareIconBase.vue";
import ItemCommonGryph from "~~/app/components/common/icons/ItemCommonGryph.vue";

withDefaults(
  defineProps<{
    size?: number
  }>(),
  {
    size: 36,
  }
)
</script>
<template>
  <div
    class="icon"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <SquareIconBase class="base" fill="#ffffff" />
    <ItemCommonGryph class="glyph" fill="#202020" />
  </div>
</template>
<style scoped>
.icon {
  position: relative;
  width: 64px;
  height: 64px;
  transform: scale(0.9);

}
.base,
.glyph {
  position: absolute;
  inset: 0;
}
</style>