<script setup lang="ts">
import { useId } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    gradientFrom: string
    gradientTo: string
    stroke?: string
    width?: number
  }>(),
  {
    stroke: "#727272",
    width: 70,
  }
)
const uid = useId()
const gradId = `category-label-grad-${uid}`
const shadowId = `category-label-shadow-${uid}`

const height = props.width * 42 / 120
</script>
<template>
  <svg 
    :width="width"
    :height="height"
    viewBox="0 0 120 42"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="gradientFrom" />
        <stop offset="100%" :stop-color="gradientTo" />
      </linearGradient>

      <filter :id="shadowId">
        <feDropShadow
          dx="0"
          dy="3"
          stdDeviation="2"
          flood-color="rgba(0,0,0,.1)"/>
      </filter>
    </defs>

    <polygon
      points="12,1 108,1 119,21 108,40 12,40 1,21"
      :fill="`url(#${gradId})`"
      :stroke="stroke"
      stroke-width="2"
      :filter="`url(#${shadowId})`"
    />

    <text
      x="60"
      y="27"
      text-anchor="middle"
      fill="white"
      font-size="18"
      font-weight="bold"
    >
      {{ text }}
    </text>
  </svg>
</template>