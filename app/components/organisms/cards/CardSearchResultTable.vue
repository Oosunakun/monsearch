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
    isLoading?: boolean
    isError?: boolean
    errorTitle?: string
    errorText?: string
  }>(),
  {
    isLoading: false,
    isError: false,
    errorTitle: 'データの取得に失敗しました',
    errorText: '時間をおいて再試行してください。'
  }
)
</script>

<template>
  <v-card variant="outlined">
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
        <slot name="error-actions" />
      </template>
    </AppErrorState>

    <EmptyState v-else-if="items.length === 0">
      <template #actions>
        <slot name="empty-actions" />
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
        hide-default-footer
        items-per-page="-1"
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
