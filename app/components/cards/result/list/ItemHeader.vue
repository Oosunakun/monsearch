<script setup lang="ts">
import type { Card } from '~~/types/cards/finderCards'
import ItemHeaderStat from '~~/app/components/cards/result/list/ItemHeaderStat.vue'
import ItemHeaderName from '~~/app/components/cards/result/list/ItemHeaderName.vue'
import ItemHeaderArchetype from '~~/app/components/cards/result/list/ItemHeaderArchetype.vue'

defineProps<{
  card: Card
}>()
</script>
<template>
  <div class="card-item-header px-1 pt-1">
    <ItemHeaderStat :card="card" />
    <ItemHeaderName :card="card" />
    <ItemHeaderArchetype :card="card" />
  </div>
</template>

<style scoped>
.card-item-header {
  width: 100%;
}
</style>