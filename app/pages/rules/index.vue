<script setup lang="ts">
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import {
  mockRuleConstructionNotes,
  mockRuleReplacementHeaders,
  mockRuleNoticeItems,
  mockRuleReplacementSources
} from '~~/app/utils/mockData'

type NoticeItem = {
  id: string
  text: string
}

type RuleNote = {
  id: string
  text: string
  emphasized?: boolean
}

type TextReplacementRow = {
  id: string
  beforeText: string
  afterText: string
  note: string
  zebra: boolean
}

type TextReplacementSource = Omit<TextReplacementRow, 'zebra'>

const noticeItems: NoticeItem[] = mockRuleNoticeItems
const constructionNotes: RuleNote[] = mockRuleConstructionNotes

const replacementHeaders = mockRuleReplacementHeaders

const replacementSources: TextReplacementSource[] = mockRuleReplacementSources

const replacementRows = computed<TextReplacementRow[]>(() =>
  replacementSources.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)
</script>

<template>
  <section class="d-flex flex-column ga-4">
    <v-card variant="outlined">
      <AppSectionHeader title="注意事項" color="primary" text-class="text-white" />
      <v-card-text>
        <p v-for="item in noticeItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
        <p class="text-body-2">
          <a href="#" class="text-accent">
            公式サイト・最新裁定: モンスター・コレクションTCG公式ルールページ
          </a>
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="カードテキストの置き換え" color="accent" text-class="text-white" />
      <v-data-table
        :headers="replacementHeaders"
        :items="replacementRows"
        item-value="id"
        fixed-header
        height="320"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        class="rules-table"
      >
        <template #item="{ item }">
          <ZebraTableRow :zebra="item.zebra">
            <td class="px-3 py-2">{{ item.beforeText }}</td>
            <td class="px-3 py-2">{{ item.afterText }}</td>
            <td class="px-3 py-2">{{ item.note }}</td>
          </ZebraTableRow>
        </template>
      </v-data-table>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="構築ルールの補足" color="accent" text-class="text-white" />
      <v-card-text>
        <ul class="pl-5">
          <li
            v-for="note in constructionNotes"
            :key="note.id"
            class="text-body-2 mb-1"
            :class="{ 'font-weight-bold': note.emphasized }"
          >
            {{ note.text }}
          </li>
        </ul>
      </v-card-text>
    </v-card>
  </section>
</template>

<style scoped>
.rules-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-secondary));
  color: #3e2723;
  font-weight: 700;
}

</style>
