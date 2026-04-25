<script setup lang="ts">
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'

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

const noticeItems: NoticeItem[] = [
  {
    id: 'description',
    text: '本サイトのルール解説は公式資料に基づいて作成していますが、非公式の補助情報です。大会参加時は必ず公式規定をご確認ください。'
  },
  { id: 'updated', text: '最終更新日: 2026-04-22' }
]

const constructionNotes: RuleNote[] = [
  { id: '1', text: 'デック枚数は50枚ちょうどで構築します。' },
  { id: '2', text: '同名カードは3枚まで採用可能です（カード別の個別制限が優先）。' },
  { id: '3', text: 'タイトルカードは勢力条件を満たした場合のみ有効です。', emphasized: true },
  { id: '4', text: '制限カード・禁止カードの判定は対戦当日のレギュレーションを適用します。', emphasized: true },
  { id: '5', text: '公式イベントでは最新FAQ・裁定更新を優先して適用します。' }
]

const replacementHeaders = [
  { title: '変更前', key: 'beforeText', sortable: false },
  { title: '変更後', key: 'afterText', sortable: false },
  { title: '補足', key: 'note', sortable: false }
]

const replacementSources: TextReplacementSource[] = [
  { id: 'r1', beforeText: '即時召喚可能', afterText: 'このカードは即時召喚できる', note: '最新の効果文テンプレートへ統一' },
  { id: 'r2', beforeText: '普通召喚フェイズ', afterText: '召喚フェイズ', note: 'フェイズ名称の統一' },
  { id: 'r3', beforeText: '対象ユニット1体を行動完了にする', afterText: '対象ユニット1体を行動完了状態にする', note: '状態語の明確化' },
  { id: 'r4', beforeText: '捨て山', afterText: '墓地', note: 'ゾーン名称の現行化' }
]

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
