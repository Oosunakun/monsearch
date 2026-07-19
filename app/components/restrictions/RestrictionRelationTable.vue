<script setup lang="ts">
import { useDisplay } from 'vuetify'
import StickyTableHeaderRow from '~~/app/components/common/layout/StickyTableHeaderRow.vue'
import RestrictionRelationTableRow from '~~/app/components/restrictions/RestrictionRelationTableRow.vue'
import { UI_COLORS } from '~~/app/utils/constants/colors'
import { useHydrated } from '~~/app/composables/useHydrated'
import SkeletonLoader from '~/components/common/app/SkeletonLoader.vue'

export type RestrictionRelationSection = {
  id: string
  kind: 'section'
  sectionTitle: string
  sectionNote: string
  sectionNoteColor: string
}
export type RestrictionRelationItem = {
  id: string
  kind: 'item'
  referenceLabel: string
  restrictionStatus: string
  name: string
  productName: string
  cardCategoryName: string
  restrictionNote: string
  zebra: boolean
}
export type RestrictionRelationRow = RestrictionRelationSection | RestrictionRelationItem

defineProps<{
  headers: { title: string; key: string }[]
  rows: RestrictionRelationRow[]
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
          <tr v-if="item.kind === 'section'">
            <td :colspan="headers.length" class="pa-0" style="border-bottom: none;">
              <v-sheet
                color="accent"
                class="px-2 py-2 font-weight-bold d-flex flex-column"
                min-height="auto"
                rounded
              >
                <div class="d-flex align-center font-weight-bold text-subtitle-2">
                  {{ item.sectionTitle }}
                </div>
                <div 
                  v-if="!mobile && item.sectionNote" 
                  class="text-caption mt-1 ml-4"
                  style="opacity: 0.8; line-height: 1.0; font-size: 0.8rem;"
                  :style="{color: item.sectionNoteColor || UI_COLORS.HEADING_BROWN,}"
                >
                  {{ item.sectionNote }}
                </div>
              </v-sheet>
            </td>
          </tr>
          <RestrictionRelationTableRow
            v-else
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