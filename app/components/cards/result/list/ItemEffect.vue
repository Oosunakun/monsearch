<script setup lang="ts">
import type { CardSearchResultItem } from '~~/server/types/cardSearch'
import { createCardDesign } from '~~/app/utils/cardDesign'

const props = defineProps<{
  card: CardSearchResultItem
}>()

const design = createCardDesign(props.card)

const effects = computed(() => props.card.effects)

const isTextOnlyEffect = (effect: CardSearchResultItem['effects'][number]) => {
  return Boolean(effect.effect_text) && Object.entries(effect).every(([key, value]) =>
    key === 'effect_text' || value === '' || value === null,
  )
}

const effectBackgroundColor = computed(() => {
  return design.effectBackgroundColor()
})

</script>
<template>
  <div
    class="card-item-effects pa-1 mt-0 mb-1 ml-1 mr-1"
    style="backdrop-filter:blur(3px);"
    :style="{ backgroundColor: effectBackgroundColor }"
  >
    <div 
      v-for="(eff, index) in effects" 
      :key="index" 
      class="effect-block"
      :class="{
        'effect-kind-boundary': index > 0 && isTextOnlyEffect(eff),
        'effect-line-text-only' : isTextOnlyEffect(eff)
      }"
    >
      <div v-if="!isTextOnlyEffect(eff)" class="effect-line d-flex align-center w-100 bg-white pa-1">
        <div class="effect-title-group d-flex align-center">
          <span v-if="eff.effect_type_name" class="effect-type-prefix flex-shrink-0 text-grey-darken-4">
            {{ eff.effect_type_name.charAt(0) }}
          </span>
          <span v-if="eff.effect_activation_type_name" class="effect-activation-type flex-shrink-0 mr-1 font-weight-bold text-grey-darken-4">
            {{ eff.effect_activation_type_name }}
          </span>
          <strong v-if="eff.effect_name" class="effect-name font-weight-bold text-grey-darken-4">
            {{ eff.effect_name }}
          </strong>
        </div>
        <span
          v-if="eff.effect_activation_category_code" 
          :class="`activation-category-chip ml-auto ml-md-4 activation-category-${eff.effect_activation_category_code}`"
        >
          {{ eff.effect_activation_category_code }}
        </span>
      </div>

      <div v-if="eff.effect_condition_text" class="effect-line d-flex align-center w-100">
        <span class="meta-label flex-shrink-0 font-weight-bold">使用条件：</span>
        <span class="square-chip condition-chip">{{ eff.effect_condition_text }}</span>
      </div>

      <div v-if="eff.effect_activation_timing_name" class="effect-line d-flex align-center w-100">
        <span class="meta-label flex-shrink-0 font-weight-bold">発揮：</span>
        <span class="square-chip timing-chip">{{ eff.effect_activation_timing_name }}</span>
      </div>

      <div v-if="eff.effect_cost_text" class="effect-line d-flex align-center w-100">
        <span class="meta-label flex-shrink-0 font-weight-bold">コスト：</span>
        <span class="square-chip cost-chip">{{ eff.effect_cost_text }}</span>
      </div>

      <div v-if="eff.effect_target_name" class="effect-line d-flex align-center w-100">
        <span class="meta-label flex-shrink-0 font-weight-bold">対象：</span>
        <span class="square-chip target-chip">{{ eff.effect_target_name }}</span>
      </div>

      <div v-if="eff.effect_text" class="effect-body-line text-grey-darken-3 text-caption w-100">
        {{ eff.effect_text }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-item-effects {
  display: flex;
  flex-direction: column;;
  border-radius: 2px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.effect-block {
  width: 100%;
}

.effect-kind-boundary {
  border-top: 1px solid #e0e0e0;
  margin-top: 4px;
  padding-top: 4px;
}

/* 効果同士を区切る薄い水平線 */
.effect-divider {
  border-color: #e0e0e0 !important;
  opacity: 0.6;
  margin-bottom: 5px;
  margin-top: 4px;
}

/* 各行のベース */
.effect-line {
  font-family: monospace, sans-serif;
  font-size: 0.70rem;
  line-height: 1.2rem;
  margin-top: 2px;
  /* heightの固定値を廃止することでマージンが綺麗に反映され、
     モバイルでの文字の縦潰れを防ぎます */
}

.effect-line-text-only {
  margin-bottom: 2px;
}

.effect-title-group {
  min-width: 0;
}
.effect-type-prefix{
  font-size: 0.80rem;
  margin-right: 2px;
}
.effect-activation-type {
  font-size: 0.80rem;
  margin-right: 2px;
}
.effect-name {
  font-size: 0.80rem;
}

.meta-label {
  color: #414141;
  font-weight: bold;
  font-size: 0.7rem;
}

/* 共通：シャープな四角形デザインのChip */
.square-chip {
  display: inline-block;
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
  overflow-wrap: anywhere;
  max-width: 100%;
  min-width: 0;
  vertical-align: middle;
  text-align: left;

  font-size: 0.7rem;
  padding: 1px 6px;
  border-radius: 2px;
  border: 1px solid transparent;
  line-height: 1.2;
}

/* タイトルを包むラッパー：モバイルでは余計な干渉をしないよう width: 100% (min-width: 0含む) */
.effect-title-container {
  flex-grow: 1;
  min-width: 0;
  padding-right: 8px;
}

/* 各四角形Chipのカラーテーマ */
.activation-category-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid transparent;
  line-height: 1.2;
  letter-spacing: 0.015rem;
  font-weight: 900;
  width: 50px;
}
.activation-category-Field {
  background-color: #37B05C;
  color: #ffffff;
  border-color: #e0e0e0;
}
.activation-category-Deck {
  background-color: #FAFC10;
  color: #202020;
  border-color: #e0e0e0;
}
.activation-category-Battle {
  background-color: #EC2C2C;
  color: #ffffff;
  border-color: #e0e0e0;
}

.condition-chip {
  background-color: #e2e8f0;
  color: #334155;
  border-color: #94a3b8;
  box-shadow: 0 1px 2px rgba(119, 116, 116, 0.2);
}

.timing-chip {
  background-color: #e0f2f1;
  color: #004d40;
  border-color: #b2dfdb;
  box-shadow: 0 1px 2px rgba(119, 116, 116, 0.2);
}

.cost-chip {
  background-color: #efebe9;
  color: #4e342e;
  border-color: #d7ccc8;
  box-shadow: 0 1px 2px rgba(119, 116, 116, 0.2);
}

.target-chip {
  background-color: #e8eaf6;
  color: #1a237e;
  border-color: #c5cae9;
  box-shadow: 0 1px 2px rgba(119, 116, 116, 0.2);
}

/* 効果本文：改行を保持し、全文を表示する */
.effect-body-line {
  white-space: pre-line;
  font-size: 0.75rem;
  line-height: 1.4;
  margin-top: 3px;
}
</style>
