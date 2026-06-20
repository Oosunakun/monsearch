<script setup lang="ts">
import CircleIconBase from '~~/app/components/atoms/common/CircleIconBase.vue'
import SummonerGlyph from '~~/app/components/atoms/common/SummonerGlyph.vue'
import type { CircleColorShifts } from '~~/app/utils/circleIcon'

const props = withDefaults(
  defineProps<{
    size?: number
  }>(),
  {
    size: 36,
  }
)

const SUMMONER_ICON_COLOR_SHIFT: CircleColorShifts = {
  start: {
    hue: 0,
    saturation: 0,
    lightness: 0,
  },
  middle: {
    hue: -7,
    saturation: -16,
    lightness: -20,
  },
  end: {
    hue: -15,
    saturation: -30,
    lightness: -35,
  },
  stroke: {
    hue: -14,
    saturation: -37,
    lightness: -50,
  },
  shadow: {
    hue: -14,
    saturation: -35,
    lightness: -58,
  },
}

</script>
<template>
  <div
    class="icon"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <CircleIconBase class="base" base-color="#FFF4AE" :color-shifts="SUMMONER_ICON_COLOR_SHIFT"/>
    <SummonerGlyph class="glyph" />
  </div>
</template>
<style scoped>
.icon{
  position:relative;
  width:64px;
  height:64px;
  padding: 0%;
  margin: 0%;
}
.base,
.glyph{
    position:absolute;
    inset:0;
}
.glyph {
  transform: scale(1.25) translateY(0.25px);
  transform-origin: center;
}
</style>