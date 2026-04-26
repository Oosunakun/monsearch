<script setup lang="ts">
import {
  isItemCard,
  isLandCard,
  isTokenCard,
  isUnitCard
} from '~~/types/card'
import type { CardDetail, ElementCode } from '~~/types/card'
import CardMetaChips from '~~/app/components/molecules/cards/CardMetaChips.vue'
import CardEffectList from '~~/app/components/organisms/cards/CardEffectList.vue'
import SectionCardShell from '~~/app/components/atoms/common/SectionCardShell.vue'
import SkeletonLoader from '~~/app/components/atoms/common/SkeletonLoader.vue'
import { CARD_CATEGORY_COLORS, CARD_ELEMENT_COLORS } from '~~/app/utils/constants/colors'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    card: CardDetail
    imageUrl?: string
    isLoading?: boolean
  }>(),
  {
    imageUrl: '',
    isLoading: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const modalThemeStyle = computed<Record<string, string>>(() => {
  const categoryColor = CARD_CATEGORY_COLORS[props.card.card_category]
  const elementColor =
    props.card.element.length > 0
      ? CARD_ELEMENT_COLORS[props.card.element[0] as ElementCode]
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

const isUnit = computed(() => isUnitCard(props.card))
const isLand = computed(() => isLandCard(props.card))
const isToken = computed(() => isTokenCard(props.card))
const isItem = computed(() => isItemCard(props.card))
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

      <SkeletonLoader
        v-if="isLoading"
        preset="card-detail"
        :min-height="640"
      />

      <template v-else>
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

          <SectionCardShell content-class="text-caption">
            <p>種族: {{ card.race && card.race.length > 0 ? card.race.join(' / ') : '-' }}</p>
            <p>タイプ: {{ card.type && card.type.length > 0 ? card.type.join(' / ') : '-' }}</p>
            <p v-if="isUnit || isToken">移動タイプ: {{ card.move_type ?? '-' }}</p>
            <p v-if="isLand">地形カテゴリ: {{ card.land_category ?? '-' }}</p>
            <p v-if="isItem">アイテム分類: {{ card.item_category ?? '-' }}</p>
          </SectionCardShell>

          <CardEffectList :card="card" />

          <SectionCardShell :margin-bottom="false" content-class="text-caption py-2">
            <p>レア: {{ card.rarity }} / 参照: {{ card.reference_label ?? card.product_note }}</p>
            <p>イラスト: {{ card.illustrator ?? '-' }} / 収録: {{ card.product_name ?? '-' }}</p>
          </SectionCardShell>
        </div>
      </template>
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
