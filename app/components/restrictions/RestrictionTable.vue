<script setup lang="ts">
import { useDisplay } from 'vuetify'
import StickyTableHeaderRow from '~~/app/components/common/layout/StickyTableHeaderRow.vue'
import RestrictionTableRow from '~~/app/components/restrictions/RestrictionTableRow.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'
import { useHydrated } from '~~/app/composables/useHydrated'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'

export type RestrictionRow = {
  id: string
  referenceLabel: string
  restrictionStatus: string
  name: string
  productName: string
  cardCategoryName: string
  restrictionNote: string
  zebra: boolean
}

defineProps<{
  headers: { title: string; key: string }[]
  rows: RestrictionRow[]
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
        height="480"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        :hide-default-header="mobile"
        class="border rounded-md overflow-hidden"
      >
        <template #item="{ item }">
          <RestrictionTableRow
            :restriction-status="item.restrictionStatus"
            :reference-label="item.referenceLabel"
            :name="item.name"
            :card-category-name="item.cardCategoryName"
            :product-name="item.productName"
            :restriction-note="item.restrictionNote"
            :zebra="item.zebra"
          />
        </template>
      </v-data-table>
    </StickyTableHeaderRow>
  </template>
</template>