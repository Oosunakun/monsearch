<script setup lang="ts">
import { computed, useId } from 'vue'
import { shiftColor } from '~~/app/utils/hexColor'
import type { CircleColorShifts } from '~~/app/utils/circleIcon'

const props = withDefaults(
  defineProps<{
    baseColor?: string
    colorShifts?: CircleColorShifts
  }>(),
  {
    baseColor: '#FFFFFF',
  },
)

const uid = useId()

const gradId = `circle-icon-grad-${uid}`
const shadowId = `circle-icon-shadow-${uid}`
const highlightId = `circle-icon-highlight-${uid}`

const DEFAULT_COLOR_SHIFT: CircleColorShifts = {
  start: {
    hue: 0,
    saturation: 0,
    lightness: 0,
  },
  middle: {
    hue: 0,
    saturation: 0,
    lightness: 0,
  },
  end: {
    hue: 0,
    saturation: 0,
    lightness: 0,
  },
  stroke: {
    hue: 0,
    saturation: 0,
    lightness: 0,
  },
  shadow: {
    hue: 0,
    saturation: 0,
    lightness: 0,
  },
}

const colorShifts = computed(() => props.colorShifts ?? DEFAULT_COLOR_SHIFT)

const startColor = computed(() => shiftColor(props.baseColor, colorShifts.value.start))
const middleColor = computed(() => shiftColor(props.baseColor, colorShifts.value.middle))
const endColor = computed(() => shiftColor(props.baseColor, colorShifts.value.end))
const strokeColor = computed(() => shiftColor(props.baseColor, colorShifts.value.stroke))
const shadowColor = computed(() => shiftColor(props.baseColor, colorShifts.value.shadow))

</script>
<template>
  <svg viewBox="0 0 64 64">
    <defs>
      <radialGradient :id="gradId" cx="40%" cy="30%">
        <stop offset="0%" :stop-color="startColor" />
        <stop offset="70%" :stop-color="middleColor" />
        <stop offset="100%" :stop-color="endColor" />
      </radialGradient>

      <radialGradient id="circle-icon-highlight" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="white" stop-opacity=".35" />
        <stop offset="100%" stop-color="white" stop-opacity="0" />
      </radialGradient>

      <filter :id="shadowId">
        <feDropShadow
          dx="0"
          dy="1.5"
          stdDeviation="1"
          :flood-color="shadowColor"
          flood-opacity=".4"
        />
      </filter>
    </defs>

    <circle
      cx="32"
      cy="32"
      r="30"
      :fill="`url(#${gradId})`"
      :stroke="strokeColor"
      stroke-width="2"
      :filter="`url(#${shadowId})`"
    />

    <!-- 上側ハイライト -->
    <ellipse
      cx="26"
      cy="20"
      rx="14"
      ry="8"
      :fill="`url(#${highlightId})`"
    /> 
  </svg>
</template>