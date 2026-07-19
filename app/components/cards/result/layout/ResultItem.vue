<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed } from 'vue'
import type { Card } from '~~/types/cards/finderCards'
import ItemHeader from '~~/app/components/cards/result/list/ItemHeader.vue'
import ItemBody from '~~/app/components/cards/result/list/ItemBody.vue'
import ItemEffect from '~~/app/components/cards/result/list/ItemEffect.vue'
import ItemMeta from '~~/app/components/cards/result/list/ItemMeta.vue'
import CardTextureBackground from '~~/app/components/cards/shared/CardTextureBackground.vue'
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

    <ItemHeader :card="card" class="layer-header" />

    <ItemBody :card="card" class="layer-body" />

    <div v-if="card.effects && card.effects.length" class="layer-effect">
      <ItemEffect :card="card" />
    </div>

    <ItemMeta :card="card" class="layer-meta" />
  </div>
</template>

<style scoped>
.card-search-result-item {
  position: relative;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e0e0e0;
  
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

.layer-header,
.layer-body,
.layer-effect,
.layer-meta {
  position: relative;
  z-index: 1;
}
</style>