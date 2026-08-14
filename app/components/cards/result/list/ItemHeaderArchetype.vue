<script setup lang="ts">
import type { Card } from '~~/types/cards/finderCards'

defineProps<{
  card: Card
}>()
</script>
<template>
  <div class="archetype-wrapper d-flex flex-column flex-sm-row ga-md-2 ga-0">
    <div 
      v-if="card.unit?.races && card.unit?.races.length > 0"
      class="header-archetype-line archetype-label-box d-flex flex-wrap ga-1"
    >
      <span class="race-label">種族：</span>
      <span 
        v-for="race in card.unit?.races" 
        :key="race.race_id" 
        class="rectangle-chip tribe-chip"
      >
        {{ race.race_name }}
      </span>
    </div>

    <div
      v-if="card.card_types && card.card_types.length > 0"
      class="header-archetype-line archetype-label-box d-flex flex-wrap ga-1"
    >
      <span class="type-label">タイプ：</span>
      <span 
        v-for="t in card.card_types" 
        :key="t.card_type_id" 
        class="rectangle-chip type-chip"
      >
        {{ t.card_type_name }}
      </span>
    </div>
  </div>
</template>
<style scoped>
.archetype-wrapper {
  width: 100%;
  align-items: flex-start;
  margin-top: 2px;
}

.header-archetype-line {
  margin-top: 2px;
  margin-bottom: 2px;
  padding-left: 3px;
  align-items: center;
  display: inline-flex;
}

.archetype-label-box {
  font-size: 0.650rem;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px; /* 直線の硬さを和らげる緩やかな角丸 */
  
  /* 直下のItemBody（スタッツピル）のトーンに合わせた薄グレーのグラデーション */
  background: linear-gradient(to bottom, #ffffffEE, #f5f5f566);
  border: 1px solid #dcdcdc; /* 輪郭をシャープに見せる薄い枠線 */
  
  display: inline-flex;
  align-items: center;
  height: 1.3rem;
  line-height: 1;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); /* ほんの微弱なシャドウ */
}
/* 左端のカラーバーを廃止し、文字色だけで実カードの文脈を表現 */
.race-label {
  color: #5d4037; /* 実カードの種族をオマージュした焦げ茶色 */
}

.type-label {
  color: #c62828; /* 実カードのタイプをオマージュした濃い赤色 */
}

.rectangle-chip {
  font-size: 0.65rem;
  padding: 1px 6px;
  border-radius: 2px;
  line-height: 1.15;
  display: inline-flex;
  align-items: center;
}

.tribe-chip {
  background-color: #ffffff;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-color: #3c3c3c60;
  border-radius: 4px;
}

.type-chip {
  background-color: #ffffff;
  color: #424242;
  border: 1px solid #e0e0e0;
  border-color: #3c3c3c60;
  border-radius: 4px;
}
</style>