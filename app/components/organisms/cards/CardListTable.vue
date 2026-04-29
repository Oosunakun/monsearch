<script setup lang="ts">
import type { CardListHeader, CardListRow } from '~~/app/types/ui/cards'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import SkeletonLoader from '~~/app/components/atoms/common/SkeletonLoader.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'

defineProps<{
  headers: CardListHeader[]
  items: CardListRow[]
  height?: number | string
  isLoading?: boolean
}>()

const emit = defineEmits<{
  rowClick: [row: CardListRow]
}>()
</script>

<template>
  <v-card variant="outlined">
    <SkeletonLoader
      v-if="isLoading"
      preset="table-rows"
      :height="height ?? 620"
      :min-height="height ?? 620"
    />

    <StickyTableHeaderRow v-else :text-color="UI_COLORS.WHITE" :header-background="UI_COLORS.PRIMARY">
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
