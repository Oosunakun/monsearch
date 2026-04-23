<script setup lang="ts">
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

const headers = [
  { title: 'セットコード', key: 'setCode', sortable: false },
  { title: 'タイトル', key: 'title', sortable: false },
  { title: 'ブロック', key: 'block', sortable: false },
  { title: '備考', key: 'note', sortable: false },
  { title: '発売日', key: 'releaseDate', sortable: false }
]

const sources: ExpansionSource[] = [
  {
    sectionTitle: '第六極神紀ブロック',
    rows: [
      { id: '6d', setCode: '6D', title: '悠久のハルシオン', block: '第六極神紀', note: '最終セット', releaseDate: '2014-03-14' },
      { id: '6c', setCode: '6C', title: 'アゾールの黒い旋風', block: '第六極神紀', note: '再録強化', releaseDate: '2013-11-22' },
      { id: '6b', setCode: '6B', title: '紅河の戦慄', block: '第六極神紀', note: '英雄点導入', releaseDate: '2013-07-19' }
    ]
  },
  {
    sectionTitle: '第五聖竜帝国ブロック',
    rows: [
      { id: '5d', setCode: '5D', title: '魔海神の魔壺', block: '第五聖竜帝国', note: '大型環境', releaseDate: '2012-12-14' },
      { id: '5c', setCode: '5C', title: '剣姫', block: '第五聖竜帝国', note: '構築人気', releaseDate: '2012-09-28' }
    ]
  },
  {
    sectionTitle: '第四風神雷神ブロック',
    rows: [
      { id: '4d', setCode: '4D', title: '天空の覇者', block: '第四風神雷神', note: '属性推し', releaseDate: '2011-12-09' },
      { id: '4c', setCode: '4C', title: '神霊獣の咆哮', block: '第四風神雷神', note: '耐性環境', releaseDate: '2011-08-26' },
      { id: '4b', setCode: '4B', title: '雷鳴の舞姫', block: '第四風神雷神', note: '先攻重視', releaseDate: '2011-05-13' }
    ]
  }
]

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