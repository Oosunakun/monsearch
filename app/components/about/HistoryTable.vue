<script setup lang="ts">
import { useDisplay } from 'vuetify'
import StickyTableHeaderRow from '~~/app/components/common/layout/StickyTableHeaderRow.vue'
import HistoryTableRow from '~~/app/components/about/HistoryTableRow.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'
import { useHydrated } from '~~/app/composables/useHydrated'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'

export type HistoryRow = {
  id: string
  date: string
  version: string
  update: string
  zebra: boolean
}

defineProps<{
  headers: { title: string; key: string }[]
  rows: HistoryRow[]
}>()

const { mobile } = useDisplay()
const { isMounted } = useHydrated()
</script>

<template>
  <template v-if="!isMounted">
    <SkeletonLoader 
      height="360"
      preset="table-rows"
      :loading="true"
    />
  </template>
  <template v-else>
    <StickyTableHeaderRow
      :text-color="UI_COLORS.HEADING_BROWN"
      :header-background="UI_COLORS.SECONDARY"
    >
      <v-data-table
        :headers="headers"
        :items="rows"
        item-value="id"
        fixed-header
        height="360"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        :hide-default-header="mobile"
        class="border rounded-md overflow-hidden"
      >
        <template #item="{ item }">
          <HistoryTableRow
            :date="item.date"
            :version="item.version"
            :update="item.update"
            :zebra="item.zebra"
          />
        </template>
      </v-data-table>
    </StickyTableHeaderRow>
  </template>
</template>