<script setup lang="ts">
import type { CardListHeader, CardListRow } from '~~/app/types/ui/cards'

defineProps<{
  headers: CardListHeader[]
  items: CardListRow[]
  height?: number | string
}>()

const emit = defineEmits<{
  rowClick: [row: CardListRow]
}>()
</script>

<template>
  <v-card variant="outlined">
    <v-data-table
      :headers="headers"
      :items="items"
      item-value="id"
      fixed-header
      :height="height ?? 620"
      density="comfortable"
      hide-default-footer
      items-per-page="-1"
      class="cards-table"
    >
      <template #item="{ item }">
        <tr
          class="cards-table__row"
          :class="{ 'cards-table__row--zebra': item.zebra }"
          @click="emit('rowClick', item)"
        >
          <td class="px-2 py-2">{{ item.setCode }}</td>
          <td class="px-2 py-2">
            <span class="text-accent">{{ item.cardName }}</span>
          </td>
          <td class="px-2 py-2">{{ item.category }}</td>
          <td class="px-2 py-2">{{ item.race }}</td>
          <td class="px-2 py-2">{{ item.element }}</td>
          <td class="px-2 py-2">{{ item.level }}</td>
          <td class="px-2 py-2">{{ item.attack }}</td>
          <td class="px-2 py-2">{{ item.defense }}</td>
          <td class="px-2 py-2">{{ item.rarity }}</td>
        </tr>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.cards-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-primary));
  color: #ffffff;
  font-weight: 700;
}

.cards-table :deep(tbody tr td) {
  border-bottom: 1px solid #eef3e4;
}

.cards-table__row--zebra td {
  background: #f8fbf1;
}

.cards-table__row:hover td {
  background: #eef7e3;
}

.cards-table__row {
  cursor: pointer;
}
</style>
