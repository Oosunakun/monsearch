<script setup lang="ts">
import type { CardCategory, CardDetail } from '~~/types/card'
import CardEffectItem from '~~/app/components/molecules/cards/CardEffectItem.vue'

const props = defineProps<{
  card: CardDetail
}>()

const effectfulCategories: CardCategory[] = ['Unit', 'Spell', 'Item', 'Land']

const shouldRenderEffects = computed(() => effectfulCategories.includes(props.card.card_category))
const effectPrefix = computed(() => props.card.card_category.toLowerCase())
const isToken = computed(() => props.card.card_category === 'Token')
const isSummoner = computed(
  () => props.card.card_category === 'Summoner' || props.card.card_category === 'Ritual'
)
</script>

<template>
  <div v-if="shouldRenderEffects" class="mb-3">
    <CardEffectItem
      v-for="(effect, index) in card.effects"
      :key="`${effectPrefix}-${index}`"
      :effect="effect"
    />
  </div>

  <div v-else-if="isToken" class="mb-3">
    <v-card variant="outlined">
      <v-card-text class="py-2">
        <p class="text-body-2 mb-1">トークン専用効果</p>
        <p class="text-caption text-grey-darken-1">永続効果や生成条件をここに表示します。</p>
      </v-card-text>
    </v-card>
  </div>

  <div v-else-if="isSummoner" class="mb-3">
    <v-card variant="outlined">
      <v-card-text class="py-2">
        <p class="text-body-2 mb-1">召喚術師情報</p>
        <p class="text-caption text-grey-darken-1">召喚条件・専用能力・関連カードをここに表示します。</p>
      </v-card-text>
    </v-card>
  </div>
</template>
