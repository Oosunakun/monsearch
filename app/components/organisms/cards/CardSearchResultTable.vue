<script setup lang="ts">
import type { SearchResultHeader, SearchResultRow } from '~~/app/types/ui/search'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import AppErrorState from '~~/app/components/atoms/common/AppErrorState.vue'
import EmptyState from '~~/app/components/atoms/common/EmptyState.vue'
import SkeletonLoader from '~~/app/components/atoms/common/SkeletonLoader.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'

withDefaults(
  defineProps<{
    headers: SearchResultHeader[]
    items: SearchResultRow[]
    activeConditionChips?: string[]
    isLoading?: boolean
    isError?: boolean
    errorTitle?: string
    errorText?: string
  }>(),
  {
    activeConditionChips: () => [],
    isLoading: false,
    isError: false,
    errorTitle: 'データの取得に失敗しました',
    errorText: '時間をおいて再試行してください。'
  }
)
</script>

<template>
  <v-card variant="outlined">
    <div v-if="activeConditionChips.length > 0" class="px-4 pt-4 pb-2">
      <p class="text-caption mb-2" :style="{ color: UI_COLORS.headingBrown }">適用中の検索条件</p>
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="chip in activeConditionChips"
          :key="chip"
          size="small"
          variant="outlined"
          :color="UI_COLORS.SECONDARY"
        >
          {{ chip }}
        </v-chip>
      </div>
    </div>

    <SkeletonLoader
      v-if="isLoading"
      preset="table-rows"
      :height="520"
      :min-height="520"
    />

    <AppErrorState
      v-else-if="isError"
      :title="errorTitle"
      :text="errorText"
    >
      <template #actions>
        <slot name="error-actions"></slot>
      </template>
    </AppErrorState>

    <EmptyState v-else-if="items.length === 0">
      <template #actions>
        <slot name="empty-actions"></slot>
      </template>
    </EmptyState>

    <StickyTableHeaderRow v-else :text-color="UI_COLORS.WHITE" :header-background="UI_COLORS.PRIMARY">
      <v-data-table
        :headers="headers"
        :items="items"
        item-value="id"
        fixed-header
        height="520"
        density="comfortable"
        :items-per-page="10"
        :items-per-page-options="[10, 20, 50]"
      >
        <template #item="{ item }">
          <ZebraTableRow :zebra="item.zebra">
            <td class="px-2 py-2">{{ item.setCode }}</td>
            <td class="px-2 py-2"><span class="text-accent">{{ item.cardName }}</span></td>
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

<style scoped>
:deep(.v-pagination .v-btn--active) {
  background: v-bind('UI_COLORS.PRIMARY');
  color: v-bind('UI_COLORS.WHITE');
}
</style>
