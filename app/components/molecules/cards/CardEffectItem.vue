<script setup lang="ts">
import type { CardEffect, EffectTiming } from '~~/types/card'

defineProps<{
  effect: CardEffect
}>()

const timingColorMap: Record<EffectTiming, string> = {
  Battle: 'red',
  Field: 'blue',
  Deck: 'amber',
  Passive: 'teal',
  Other: 'grey'
}
</script>

<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-text class="py-2">
      <div class="d-flex justify-space-between align-center mb-1">
        <strong class="text-body-2">{{ effect.title }}</strong>
        <v-chip size="x-small" :color="timingColorMap[effect.timing]" class="text-white">
          {{ effect.timing }}
        </v-chip>
      </div>
      <p v-if="effect.condition" class="text-caption text-grey-darken-1 mb-1">【条件】{{ effect.condition }}</p>
      <p class="text-body-2">{{ effect.text }}</p>
    </v-card-text>
  </v-card>
</template>
