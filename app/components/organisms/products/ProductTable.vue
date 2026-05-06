<script setup lang="ts">
import { useDisplay } from 'vuetify'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import ProductTableRow from '~~/app/components/molecules/common/ProductTableRow.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'
import { useHydrated } from '~~/app/composables/useHydrated'
import SkeletonLoader from '~/components/atoms/common/SkeletonLoader.vue'

export type ProductRow = {
  id: string
  shortName: string
  productName: string
  productNote: string
  releaseDate: string
  zebra: boolean
}

const props = defineProps<{
  headers: { title: string; key: string }[]
  rows: ProductRow[]
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
      >
        <template #item="{ item }">
          <ProductTableRow
            :shortName="item.shortName"
            :productName="item.productName"
            :productNote="item.productNote"
            :releaseDate="item.releaseDate"
            :zebra="item.zebra"
          />
        </template>
      </v-data-table>
    </StickyTableHeaderRow>
  </template>
</template>