<script setup lang="ts">
import type { CardCategory, CardDetail } from '~~/types/card'
import CardEffectItem from '~~/app/components/molecules/cards/CardEffectItem.vue'
import { CARD_CATEGORY_NOTES } from '~~/app/types/ui/cards'

const props = defineProps<{
  card: CardDetail
}>()

const effectfulCategories: CardCategory[] = ['Unit', 'Spell', 'Item', 'Land']

const shouldRenderEffects = computed(() => effectfulCategories.includes(props.card.card_category))
const effectPrefix = computed(() => props.card.card_category.toLowerCase())
const categoryNote = computed(() => CARD_CATEGORY_NOTES[props.card.card_category] ?? null)
</script>

<template>
  <div v-if="shouldRenderEffects" class="mb-3">
    <CardEffectItem
      v-for="(effect, index) in card.effects"
      :key="`${effectPrefix}-${index}`"
      :effect="effect"
    />
  </div>

  <div v-else-if="categoryNote" class="mb-3">
    <v-card variant="outlined">
      <v-card-text class="py-2">
        <p class="text-body-2 mb-1">{{ categoryNote.title }}</p>
        <p class="text-caption text-grey-darken-1">{{ categoryNote.description }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>
