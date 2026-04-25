<script setup lang="ts">
import { mockExpansionHeaders, mockExpansionSources } from '~~/app/utils/mockData'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'

type ExpansionBase = {
  id: string
  kind: 'item'
  setCode: string
  title: string
  block: string
  note: string
  releaseDate: string
  zebra: boolean
}

type ExpansionSection = {
  id: string
  kind: 'section'
  sectionTitle: string
}

type ExpansionRow = ExpansionBase | ExpansionSection

type ExpansionSource = {
  sectionTitle: string
  rows: Omit<ExpansionBase, 'kind' | 'zebra'>[]
}

const headers = mockExpansionHeaders

const sources: ExpansionSource[] = mockExpansionSources

const tableRows = computed<ExpansionRow[]>(() => {
  const rows: ExpansionRow[] = []
  let itemIndex = 0

  for (const source of sources) {
    rows.push({
      id: `section-${source.sectionTitle}`,
      kind: 'section',
      sectionTitle: source.sectionTitle
    })

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
  <section>
    <AppSectionHeader title="エクスパンション一覧" color="secondary" class="mb-4" />

    <v-card variant="outlined">
      <StickyTableHeaderRow theme="secondary" text-color="#3e2723">
        <v-data-table
          :headers="headers"
          :items="tableRows"
          item-value="id"
          fixed-header
          height="560"
          density="comfortable"
          hide-default-footer
          items-per-page="-1"
          class="expansion-table"
        >
          <template #item="{ item }">
            <tr v-if="item.kind === 'section'" class="expansion-table__section-row">
              <td :colspan="headers.length" class="pa-0">
                <v-sheet color="accent" class="px-3 py-2 text-white font-weight-bold">
                  {{ item.sectionTitle }}
                </v-sheet>
              </td>
            </tr>
            <ZebraTableRow
              v-else
              :zebra="item.zebra"
              class="expansion-table__item-row"
            >
              <td class="px-3 py-2">{{ item.setCode }}</td>
              <td class="px-3 py-2">
                <span class="text-accent">{{ item.title }}</span>
              </td>
              <td class="px-3 py-2">{{ item.block }}</td>
              <td class="px-3 py-2">{{ item.note }}</td>
              <td class="px-3 py-2">{{ item.releaseDate }}</td>
            </ZebraTableRow>
          </template>
        </v-data-table>
      </StickyTableHeaderRow>
    </v-card>
  </section>
</template>

<style scoped>
.expansion-table__section-row td {
  border-bottom: none;
}
</style>