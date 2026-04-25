<script setup lang="ts">
import type { CardListHeader, CardListRow } from '~~/app/types/ui/cards'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'

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
    <StickyTableHeaderRow theme="primary" text-color="#ffffff">
      <v-data-table
        :headers="headers"
        :items="items"
        item-value="id"
        fixed-header
        :height="height ?? 620"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
      >
        <template #item="{ item }">
          <ZebraTableRow
            :zebra="item.zebra"
            clickable
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
          </ZebraTableRow>
        </template>
      </v-data-table>
    </StickyTableHeaderRow>
  </v-card>
</template>
