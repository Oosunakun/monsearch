<script setup lang="ts">
import { computed } from 'vue'
import type { Card } from '~~/types/cards/finderCards'
import HexagramIcon from '~~/app/components/common/icons/HexagramIcon.vue'
import CrescentIcon from '~~/app/components/common/icons/CrescentIcon.vue'
import { createCardDesign } from '~~/app/utils/cardDesign'
const props = defineProps<{
  card: Card
}>()

const design = createCardDesign(props.card)

// 検索窓のロジックに合わせ、レアリティの表示タイプを安全に判定
const rarityType = computed(() => {
  return design.rarityType()
})
</script>
<template>
  <div class="card-item-meta px-1 py-1 d-none d-md-flex ga-1 mb-1 ml-1 mr-1">
    <div class="meta-row d-flex align-center flex-wrap ga-1">
      <span v-if="card.rarity_code" class="split-chip rarity-split-chip flex-shrink-0">
        <span class="chip-prefix">
          <HexagramIcon v-if="rarityType === 'hexagram'" class="rarity-graph-icon" style="width: 14px; height: 14px;"/>
          <CrescentIcon v-else-if="rarityType === 'crescent'" class="rarity-graph-icon" style="font-size: 9.5px;"/>
          <v-icon v-else size="14" :icon="rarityType" class="rarity-graph-icon" /> 
        </span>
        <span class="chip-value">{{ card.rarity_name }}</span>
      </span>
        
      <template v-if="card.blocks?.length">
        <span 
          v-for="b in card.blocks" 
          :key="b.block_name" 
          class="split-chip block-split-chip flex-shrink-0"
        >
          <span class="chip-prefix">ブロック</span>
          <span class="chip-value">{{ b.block_name }}</span>
        </span>
      </template>

      <template v-if="card.factions?.length">
        <span 
          v-for="f in card.factions" 
          :key="f.faction_name" 
          class="split-chip faction-split-chip flex-shrink-0"
        >
          <span class="chip-prefix">勢力</span>
          <span class="chip-value">{{ f.faction_name }}</span>
        </span>
      </template>

      <span v-if="card.product?.product_name" class="square-chip text-truncate ml-4" style="max-width: 240px;" :title="card.product.product_name">
        <v-icon size="13" class="mr-1 text-grey-darken-1">mdi-cards</v-icon>
        <span class="text-truncate">{{ card.product.product_name }}</span>
      </span>

      <span v-if="card.reference_label" class="square-chip text-mono flex-shrink-0">
        <v-icon size="13" class="mr-1 text-grey-darken-1">mdi-tag-text</v-icon>
        {{ card.reference_label }}
      </span>

      <span v-if="card.illustrator_name" class="square-chip text-truncate" style="max-width: 180px;" :title="card.illustrator_name">
        <v-icon size="13" class="mr-1 text-grey-darken-1">mdi-palette</v-icon>
        <span class="text-truncate">{{ card.illustrator_name }}</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
.card-item-meta {
  border-top: 1px solid #e0e0e0;
  background: linear-gradient(
    to bottom,
    #ffffffbb,
    #ffffff66
  );
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: background 0.2s ease;
  backdrop-filter:blur(3px);
}

.meta-row {
  width: 100%;
}

/* ── 1行目：共通スプリットピル型ベーススタイル ── */
.split-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  border-radius: 9999px;
  overflow: hidden;
  padding: 0;
  min-width: 0;
}

.chip-prefix {
  font-weight: bold;
  padding: 0 6px 0 8px;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 0.65rem;
}

.chip-value {
  padding: 0 8px 0 6px;
  height: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

/* ── 各項目のテーマカラー割り当て（左：濃いめの背景、右：白背景に色文字） ── */

/* レアリティ：赤系 */
.rarity-split-chip {
  border: 1px solid #ffcdd2;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.rarity-split-chip .chip-prefix {
  background-color: #ffebee;
}
.rarity-split-chip .chip-value {
  background-color: #ffffff;
  color: #d50000;
}
.rarity-graph-icon {
  color: #d50000;
  display: inline-flex;
  align-items: center;
}

/* ブロック：青系 */
.block-split-chip {
  border: 1px solid #b3e5fc;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}
.block-split-chip .chip-prefix {
  background-color: #e1f5fe;
  color: #0288d1;
}
.block-split-chip .chip-value {
  background-color: #ffffff;
  color: #01579b;
}

/* 勢力：紫・マゼンタ系 */
.faction-split-chip {
  border: 1px solid #e1bee7;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);

}
.faction-split-chip .chip-prefix {
  background-color: #f3e5f5;
  color: #7b1fa2;
}
.faction-split-chip .chip-value {
  background-color: #ffffff;
  color: #4a148c;
}

/* ── 2行目：四角型シャープChip ── */
.square-chip {
  display: inline-flex;
  align-items: center;
  font-size: 0.65rem;
  padding: 0 6px;
  border-radius: 2px;
  background-color: #f5f5f5;
  color: #424242;
  border: 1px solid #e0e0e0;
  min-width: 0;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15);
}

.text-mono {
  font-family: SFMono-Regular, Consolas, monospace;
}
</style>