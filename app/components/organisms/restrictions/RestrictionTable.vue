<script setup lang="ts">
import { useDisplay } from 'vuetify'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import RestrictionTableRow from '~~/app/components/molecules/common/RestrictionTableRow.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'
import { useHydrated } from '~~/app/composables/useHydrated'
import SkeletonLoader from '~/components/atoms/common/SkeletonLoader.vue'

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

const props = defineProps<{
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
      >
        <template #item="{ item }">
          <RestrictionTableRow
            :restrictionStatus="item.restrictionStatus"
            :referenceLabel="item.referenceLabel"
            :name="item.name"
            :cardCategoryName="item.cardCategoryName"
            :productName="item.productName"
            :restrictionNote="item.restrictionNote"
            :zebra="item.zebra"
          />
        </template>
      </v-data-table>
    </StickyTableHeaderRow>
  </template>
</template>