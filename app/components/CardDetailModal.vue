<script setup lang="ts">
import type { CardCategory, CardDetail, ElementCode } from '~~/types/card'
import CardMetaChips from '~~/app/components/molecules/cards/CardMetaChips.vue'
import CardEffectList from '~~/app/components/organisms/cards/CardEffectList.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    card: CardDetail
    imageUrl?: string
  }>(),
  {
    imageUrl: ''
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const categoryColorMap: Record<CardCategory, string> = {
  Unit: '#5E748A',
  Spell: '#4F8A56',
  Item: '#6D4C41',
  Land: '#A37A1E',
  Ritual: '#8E24AA',
  Summoner: '#8E24AA',
  Token: '#546E7A'
}

const elementColorMap: Record<ElementCode, string> = {
  Fire: '#E53935',
  Water: '#1E88E5',
  Earth: '#7CB342',
  Air: '#43A047',
  Holy: '#FBC02D',
  Curse: '#8E24AA',
  Eater: '#6D4C41',
  Beast: '#EF6C00',
  Savage: '#546E7A',
  Machina: '#00ACC1'
}

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const modalThemeStyle = computed<Record<string, string>>(() => {
  const categoryColor = categoryColorMap[props.card.card_category] ?? '#5E748A'
  const elementColor =
    props.card.elements.length > 0
      ? elementColorMap[props.card.elements[0] as ElementCode]
      : categoryColor

  return {
    '--card-frame-color': categoryColor,
    '--card-header-color': categoryColor,
    '--card-accent-color': elementColor
  }
})

const close = () => {
  isOpen.value = false
}

const isUnit = computed(() => props.card.card_category === 'Unit')
const isLand = computed(() => props.card.card_category === 'Land')
const isToken = computed(() => props.card.card_category === 'Token')
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="420"
    scrollable
  >
    <v-card
      rounded="xl"
      class="card-modal"
      :style="modalThemeStyle"
    >
      <div class="d-flex justify-end pa-2">
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          @click="close"
        />
      </div>

      <v-sheet class="mx-3 mb-3 pa-3 text-white card-modal__header" rounded="lg">
        <CardMetaChips :card="card" />
        <p class="text-h5 font-weight-bold mt-2">
          {{ card.name }}
        </p>
      </v-sheet>

      <div class="px-3 pb-3">
        <v-responsive aspect-ratio="4/3" class="rounded-lg bg-grey-lighten-2 d-flex align-center justify-center mb-3">
          <v-img v-if="imageUrl" :src="imageUrl" cover />
          <span v-else class="text-subtitle-2 text-grey-darken-1">Card Image</span>
        </v-responsive>

        <v-card variant="tonal" class="mb-3">
          <v-card-text class="text-caption">
            <p>種族: {{ card.races.length > 0 ? card.races.join(' / ') : '-' }}</p>
            <p>スペルスロット: {{ card.spell_slots.length > 0 ? card.spell_slots.join(' ') : '-' }}</p>
            <p v-if="isUnit || isToken">移動タイプ: {{ card.move_type ?? '-' }}</p>
            <p v-if="isLand">地形カテゴリ: {{ card.races.length > 0 ? card.races.join(' / ') : '-' }}</p>
          </v-card-text>
        </v-card>

        <CardEffectList :card="card" />

        <v-card v-if="card.flavor_text" variant="tonal" class="mb-3">
          <v-card-text class="py-2">
            <p class="text-caption font-italic text-grey-darken-1">
              {{ card.flavor_text }}
            </p>
          </v-card-text>
        </v-card>

        <v-card variant="tonal">
          <v-card-text class="text-caption py-2">
            <p>レア: {{ card.rarity }} / 参照: {{ card.reference_label }}</p>
            <p>イラスト: {{ card.illustrator }} / 収録: {{ card.product_name }}</p>
          </v-card-text>
        </v-card>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.card-modal {
  border: 2px solid var(--card-frame-color);
}

.card-modal__header {
  background: var(--card-header-color);
}
</style>
