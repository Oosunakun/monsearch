<script setup lang="ts">
import type { CardEffect } from '~~/types/card'
import { CARD_EFFECT_TIMING_COLORS } from '~~/app/utils/constants/colors'

defineProps<{
  effect: CardEffect
}>()

</script>

<template>
  <v-card variant="outlined" class="mb-2">
    <v-card-text class="py-2">
      <div class="d-flex justify-space-between align-center mb-1">
        <strong class="text-body-2">{{ effect.category }}</strong>
        <v-chip v-if="effect.timing" size="x-small" :color="CARD_EFFECT_TIMING_COLORS[effect.timing] ?? 'grey'" class="text-white">
          {{ effect.timing }}
        </v-chip>
      </div>
      <p class="text-body-2">{{ effect.text }}</p>
    </v-card-text>
  </v-card>
</template>
