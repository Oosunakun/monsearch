<script setup lang="ts">
import type { Card } from '~~/types/cards/finder_cards'
import CardItemHeaderStat from './CardItemHeaderStat.vue'
import CardItemHeaderName from './CardItemHeaderName.vue'
import CardItemHeaderArchetype from './CardItemHeaderArchetype.vue'

defineProps<{
  card: Card
}>()
</script>
<template>
  <div class="card-item-header px-1 pt-1">
    <CardItemHeaderStat :card="card" />
    <CardItemHeaderName :card="card" />
    <CardItemHeaderArchetype :card="card" />
  </div>
</template>

<style scoped>
.card-item-header {
  width: 100%;
}
</style>