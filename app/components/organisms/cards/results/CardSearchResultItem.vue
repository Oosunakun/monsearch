<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import type { Card } from '~~/types/cards/finder_cards'
import CardItemHeader from './CardItemHeader.vue'
import CardItemBody from './CardItemBody.vue'
import CardItemEffect from './CardItemEffect.vue'
import CardItemMeta from './CardItemMeta.vue'
import CardTextureBackground from '~~/app/components/atoms/common/CardTextureBackground.vue'
import { createCardDesign } from '~~/app/utils/cardDesign'

const props = defineProps<{
  card: Card
}>()

const { mobile } = useDisplay()

const design = createCardDesign(props.card)

const baseBackgroundColor = computed(() => {
  return design.baseBackgroundColor()
})
</script>
<template>
  <div 
    class="card-search-result-item"
    :style="{ '--category-color': baseBackgroundColor }"
  >
    <CardTextureBackground
      :color="baseBackgroundColor"
      :opacity="0.8"
      :texture-size="mobile ? 72 : 128"
    />

    <CardItemHeader :card="card" class="layer-header" />

    <CardItemBody :card="card" class="layer-body" />

    <div v-if="card.effects && card.effects.length" class="layer-effect">
      <CardItemEffect :card="card" />
    </div>

    <CardItemMeta :card="card" class="layer-meta" />
  </div>
</template>

<style scoped>
.card-search-result-item {
  position: relative; /* 💡 疑似要素の識別ラインの基準点にするため必須 */
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e0e0e0;
  
  /* border-left から疑似要素に移行したため、左パディングで線のスペースを確保 (6pxの線 + 8pxの余白) */
  padding-left: 1px; 
  
  transition: background-color 0.15s ease;
  cursor: pointer;
  width: 100%;

  overflow: hidden;
  isolation: isolate;
}

.card-search-result-item:hover {
  background-color: #f7fbe8;
}

/* ── 💡 新設：1要素として完全に独立するグラデーション識別ライン ── */
/* .card-search-result-item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 4px;
  bottom: 4px;
  width: 5px;
  border-radius: 4px;
  
  background:var(--category-color);
  z-index: 10;
}  */

.layer-header,
.layer-body,
.layer-effect,
.layer-meta {
  position: relative;
  z-index: 1;
}
</style>