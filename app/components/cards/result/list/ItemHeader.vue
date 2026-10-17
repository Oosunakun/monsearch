<script setup lang="ts">
import { computed } from 'vue'
import type { CardSearchResultItem } from '~~/server/types/cardSearch'
import ItemHeaderStat from '~~/app/components/cards/result/list/ItemHeaderStat.vue'
import ItemHeaderName from '~~/app/components/cards/result/list/ItemHeaderName.vue'
import ItemHeaderArchetype from '~~/app/components/cards/result/list/ItemHeaderArchetype.vue'

const props = defineProps<{
  card: CardSearchResultItem
}>()

const restrictionLabel = computed(() => {
  switch (props.card.deck_restriction_count) {
    case 0: return '禁止'
    case 1: return '1枚制限'
    case 2: return '2枚制限'
    default: return null
  }
})
</script>
<template>
  <div class="card-item-header px-1 pt-1">
    <ItemHeaderStat :card="card" />
    <ItemHeaderName :card="card" />
    <div v-if="restrictionLabel" class="d-flex flex-wrap mt-1">
      <v-chip size="small" variant="tonal" :color="card.deck_restriction_count === 0 ? 'error' : 'warning'">
        {{ restrictionLabel }}
      </v-chip>
    </div>
    <ItemHeaderArchetype :card="card" />
  </div>
</template>

<style scoped>
.card-item-header {
  width: 100%;
}
</style>
