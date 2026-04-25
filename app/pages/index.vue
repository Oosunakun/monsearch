<script setup lang="ts">
import { mockExpansionHeaders, mockExpansionSources } from '~~/app/utils/mockData'

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
    <h2 class="text-h4 font-weight-bold mb-4" style="color: #3E2723;">
      エクスパンション一覧
    </h2>

    <v-card variant="outlined">
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
          <tr
            v-else
            class="expansion-table__item-row"
            :class="{ 'expansion-table__item-row--zebra': item.zebra }"
          >
            <td class="px-3 py-2">{{ item.setCode }}</td>
            <td class="px-3 py-2">
              <span class="text-accent">{{ item.title }}</span>
            </td>
            <td class="px-3 py-2">{{ item.block }}</td>
            <td class="px-3 py-2">{{ item.note }}</td>
            <td class="px-3 py-2">{{ item.releaseDate }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </section>
</template>

<style scoped>
.expansion-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-secondary));
  color: #3e2723;
  font-weight: 700;
}

.expansion-table :deep(tbody tr td) {
  border-bottom: 1px solid #eef3e4;
}

.expansion-table__item-row--zebra td {
  background: #f8fbf1;
}

.expansion-table__item-row:hover td {
  background: #eef7e3;
}

.expansion-table__section-row td {
  border-bottom: none;
}
</style>