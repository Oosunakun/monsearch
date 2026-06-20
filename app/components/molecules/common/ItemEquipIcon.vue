<script setup lang="ts">
import SquareIconBase from "~~/app/components/atoms/common/SquareIconBase.vue";
import ItemCommonGryph from "~~/app/components/atoms/common/ItemCommonGryph.vue";
const props = withDefaults(
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
    <SquareIconBase class="base" fill="#202020" />
    <ItemCommonGryph class="glyph" fill="#ffffff"/>
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