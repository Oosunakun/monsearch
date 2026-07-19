<script setup lang="ts">
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import ProductTable from '~~/app/components/products/ProductTable.vue'
import RestrictionTable from '~~/app/components/restrictions/RestrictionTable.vue'
import type { RestrictionRow } from '~~/app/components/restrictions/RestrictionTable.vue'
import RestrictionRelationTable from '~~/app/components/restrictions/RestrictionRelationTable.vue'
import type { RestrictionRelationRow } from '~~/app/components/restrictions/RestrictionRelationTable.vue'
import type { ProductRow } from '~~/app/components/products/ProductTable.vue'
import {
  mockRestrictionNoticeItems,
  mockRestrictionAvailableProductHeaders,
  mockRestrictionAvailableProductSources,
  mockRestrictionCardHeaders,
  mockRestrictionCardSources,
  mockRestrictionRelationHeaders,
  mockRestrictionRelationSources,
} from '~~/app/utils/mockData'

type TextItem = {
  id: string
  text: string
}

const noticeItems: TextItem[] = mockRestrictionNoticeItems

const restrictionHeaders = mockRestrictionCardHeaders
const restrictionSourceRows = mockRestrictionCardSources
const restrictionRows = computed<RestrictionRow[]>(() =>
  restrictionSourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)

const productHeaders = mockRestrictionAvailableProductHeaders
const productSourceRows = mockRestrictionAvailableProductSources
const productRows = computed<ProductRow[]>(() =>
  productSourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)

const restrictionRelationHeaders = mockRestrictionRelationHeaders
const restrictionRelationSourceRows = mockRestrictionRelationSources
const restrictionRelationRows = computed<RestrictionRelationRow[]>(() => {
  const rows: RestrictionRelationRow[] = []
  let itemIndex = 0
  let sectionIndex = 0

  for (const source of restrictionRelationSourceRows) {
    rows.push({
      id: `section-${sectionIndex + 1}`,
      kind: 'section',
      sectionTitle: source.sectionTitle,
      sectionNote: source.sectionNote,
      sectionNoteColor: source.sectionNoteColor
    })
    sectionIndex += 1

    for (const entry of source.rows) {
      rows.push({
        ...entry,
        kind: 'item',
        zebra: itemIndex % 2 === 1
      })
      itemIndex += 1
    }
  }

  return rows
})
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <SectionHeader title="注意事項" color="primary" text-class="text-white" />
      </template>
      <ul>
        <li v-for="item in noticeItems" :key="item.id">
          {{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="使用できるカードセット" color="accent" text-class="text-white" />
      </template>

      <ProductTable
        :headers="productHeaders"
        :rows="productRows"
      />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="禁止カード、制限カード" color="accent" text-class="text-white" />
      </template>

      <RestrictionTable
        :headers="restrictionHeaders"
        :rows="restrictionRows"
      />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="召喚術師と紐づくカード" color="accent" text-class="text-white" />
      </template>

      <RestrictionRelationTable
        :headers="restrictionRelationHeaders"
        :rows="restrictionRelationRows"
      />
    </SectionCardShell>

  </ContentMaxWidthContainer>
</template>
