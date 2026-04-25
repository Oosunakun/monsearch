<script setup lang="ts">
import type { SearchResultHeader, SearchResultRow } from '~~/app/types/ui/search'

defineProps<{
  headers: SearchResultHeader[]
  items: SearchResultRow[]
}>()
</script>

<template>
  <v-card variant="outlined">
    <v-data-table
      :headers="headers"
      :items="items"
      item-value="id"
      fixed-header
      height="520"
      density="comfortable"
      hide-default-footer
      items-per-page="-1"
      class="search-table"
    >
      <template #item="{ item }">
        <tr class="search-table__row" :class="{ 'search-table__row--zebra': item.zebra }">
          <td class="px-2 py-2">{{ item.setCode }}</td>
          <td class="px-2 py-2"><span class="text-accent">{{ item.cardName }}</span></td>
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
.search-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-primary));
  color: #ffffff;
  font-weight: 700;
}

.search-table :deep(tbody tr td) {
  border-bottom: 1px solid #eef3e4;
}

.search-table__row--zebra td {
  background: #f8fbf1;
}

.search-table__row:hover td {
  background: #eef7e3;
}
</style>
