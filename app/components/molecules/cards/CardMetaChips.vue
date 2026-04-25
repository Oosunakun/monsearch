<script setup lang="ts">
import type { CardCategory, CardDetail, ElementCode } from '~~/types/card'
import { CARD_ELEMENT_COLORS } from '~~/app/utils/constants/colors'

const props = defineProps<{
  card: CardDetail
}>()

const categoryLabelMap: Record<CardCategory, string> = {
  Unit: 'ユニット',
  Spell: 'スペル',
  Item: 'アイテム',
  Land: '地形',
  Ritual: '召喚術師',
  Summoner: '召喚術師',
  Token: 'トークン'
}

const elementLabelMap: Record<ElementCode, string> = {
  Fire: '火',
  Water: '水',
  Earth: '土',
  Air: '風',
  Holy: '聖',
  Curse: '魔',
  Eater: '喰',
  Beast: '獣',
  Savage: '荒',
  Machina: '機'
}

const categoryLabel = computed(() => categoryLabelMap[props.card.card_category] ?? props.card.card_category)
const powerLabel = computed(() => {
  if (props.card.level == null || props.card.attack == null || props.card.defense == null) {
    return null
  }

  return `Lv${props.card.level} / ${props.card.attack}/${props.card.defense}`
})
</script>

<template>
  <div class="d-flex align-start justify-space-between ga-2 flex-wrap">
    <div class="d-flex flex-wrap ga-1">
      <v-chip
        v-for="element in card.elements"
        :key="element"
        size="x-small"
        variant="flat"
        class="text-white"
        :style="{ backgroundColor: CARD_ELEMENT_COLORS[element] }"
      >
        {{ elementLabelMap[element] }}
      </v-chip>
      <v-chip
        v-if="powerLabel"
        size="x-small"
        variant="flat"
        color="grey-lighten-3"
      >
        {{ powerLabel }}
      </v-chip>
      <v-chip
        v-if="card.move_type"
        size="x-small"
        variant="flat"
        color="grey-lighten-3"
      >
        {{ card.move_type }}
      </v-chip>
    </div>
    <v-chip
      size="x-small"
      variant="flat"
      class="font-weight-bold"
      color="secondary"
    >
      {{ categoryLabel }}
    </v-chip>
  </div>
</template>
