<script setup lang="ts">
import type { CardDetail, CardCategory, ElementCode } from '~~/types/card'

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

const categoryLabelMap: Record<CardCategory, string> = {
  Unit: 'ユニット',
  Spell: 'スペル',
  Item: 'アイテム',
  Land: '地形',
  Ritual: '召喚術師',
  Summoner: '召喚術師',
  Token: 'トークン'
}

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

const timingColorMap: Record<string, string> = {
  Battle: 'red',
  Field: 'blue',
  Deck: 'amber',
  Passive: 'teal',
  Other: 'grey'
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

const categoryLabel = computed(() => categoryLabelMap[props.card.card_category] ?? props.card.card_category)
const powerLabel = computed(() => {
  if (props.card.level == null || props.card.attack == null || props.card.defense == null) {
    return null
  }
  return `Lv${props.card.level} / ${props.card.attack}/${props.card.defense}`
})

const close = () => {
  isOpen.value = false
}

const isUnit = computed(() => props.card.card_category === 'Unit')
const isSpell = computed(() => props.card.card_category === 'Spell')
const isItem = computed(() => props.card.card_category === 'Item')
const isLand = computed(() => props.card.card_category === 'Land')
const isToken = computed(() => props.card.card_category === 'Token')
const isSummoner = computed(
  () => props.card.card_category === 'Summoner' || props.card.card_category === 'Ritual'
)
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
        <div class="d-flex align-start justify-space-between ga-2 flex-wrap">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-for="element in card.elements"
              :key="element"
              size="x-small"
              variant="flat"
              class="text-white"
              :style="{ backgroundColor: elementColorMap[element] }"
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

        <div v-if="isUnit" class="mb-3">
          <v-card v-for="(effect, index) in card.effects" :key="`unit-${index}`" variant="outlined" class="mb-2">
            <v-card-text class="py-2">
              <div class="d-flex justify-space-between align-center mb-1">
                <strong class="text-body-2">{{ effect.title }}</strong>
                <v-chip size="x-small" :color="timingColorMap[effect.timing] ?? 'grey'" class="text-white">
                  {{ effect.timing }}
                </v-chip>
              </div>
              <p v-if="effect.condition" class="text-caption text-grey-darken-1 mb-1">【条件】{{ effect.condition }}</p>
              <p class="text-body-2">{{ effect.text }}</p>
            </v-card-text>
          </v-card>
        </div>

        <div v-else-if="isSpell" class="mb-3">
          <v-card v-for="(effect, index) in card.effects" :key="`spell-${index}`" variant="outlined" class="mb-2">
            <v-card-text class="py-2">
              <div class="d-flex justify-space-between align-center mb-1">
                <strong class="text-body-2">{{ effect.title }}</strong>
                <v-chip size="x-small" :color="timingColorMap[effect.timing] ?? 'grey'" class="text-white">
                  {{ effect.timing }}
                </v-chip>
              </div>
              <p v-if="effect.condition" class="text-caption text-grey-darken-1 mb-1">【条件】{{ effect.condition }}</p>
              <p class="text-body-2">{{ effect.text }}</p>
            </v-card-text>
          </v-card>
        </div>

        <div v-else-if="isItem" class="mb-3">
          <v-card v-for="(effect, index) in card.effects" :key="`item-${index}`" variant="outlined" class="mb-2">
            <v-card-text class="py-2">
              <div class="d-flex justify-space-between align-center mb-1">
                <strong class="text-body-2">{{ effect.title }}</strong>
                <v-chip size="x-small" :color="timingColorMap[effect.timing] ?? 'grey'" class="text-white">
                  {{ effect.timing }}
                </v-chip>
              </div>
              <p v-if="effect.condition" class="text-caption text-grey-darken-1 mb-1">【条件】{{ effect.condition }}</p>
              <p class="text-body-2">{{ effect.text }}</p>
            </v-card-text>
          </v-card>
        </div>

        <div v-else-if="isLand" class="mb-3">
          <v-card v-for="(effect, index) in card.effects" :key="`land-${index}`" variant="outlined" class="mb-2">
            <v-card-text class="py-2">
              <div class="d-flex justify-space-between align-center mb-1">
                <strong class="text-body-2">{{ effect.title }}</strong>
                <v-chip size="x-small" :color="timingColorMap[effect.timing] ?? 'grey'" class="text-white">
                  {{ effect.timing }}
                </v-chip>
              </div>
              <p v-if="effect.condition" class="text-caption text-grey-darken-1 mb-1">【条件】{{ effect.condition }}</p>
              <p class="text-body-2">{{ effect.text }}</p>
            </v-card-text>
          </v-card>
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
