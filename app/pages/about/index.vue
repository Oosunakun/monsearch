<script setup lang="ts">
type TextItem = {
  id: string
  text: string
}

type LinkItem = {
  id: string
  title: string
  description: string
  href: string
}

type HistoryRow = {
  id: string
  date: string
  update: string
  zebra: boolean
}

type HistorySource = Omit<HistoryRow, 'zebra'>

const disclaimerItems: TextItem[] = [
  { id: 'd1', text: '本サイトはモンコレTCG情報を扱う非公式ファンサイトです。' },
  { id: 'd2', text: '掲載情報は可能な限り正確性を確保していますが、内容の完全性・最新性を保証するものではありません。' },
  { id: 'd3', text: 'カード画像・テキスト等の著作権は各権利者（株式会社ブロッコリー等）に帰属します。' }
]

const aboutItems: TextItem[] = [
  { id: 'a1', text: 'モンサチは、モンコレTCGのカード検索・制限情報確認・構築検討を効率化するためのデータベース主体ポータルです。' },
  { id: 'a2', text: '対象ユーザーは中〜上級プレイヤーを想定し、1画面で多くの情報を把握できる高密度UIを提供します。' },
  { id: 'a3', text: '主な機能: エクスパンション一覧、詳細検索、カードリスト、使用制限、ルール参照。' }
]

const thanksItems: TextItem[] = [
  { id: 't1', text: 'カードデータ整理に協力いただいたコミュニティ有志の皆さまに感謝いたします。' },
  { id: 't2', text: '検証プレイログ提供・裁定確認にご協力いただいた店舗スタッフおよび大会運営関係者の皆さま、ありがとうございます。' },
  { id: 't3', text: '継続的なフィードバックをくださるプレイヤーの皆さまの支援により、本サイトは改善を続けています。' }
]

const historyHeaders = [
  { title: '日付', key: 'date', sortable: false },
  { title: '更新内容', key: 'update', sortable: false }
]

const historySourceRows: HistorySource[] = [
  { id: 'h1', date: '2026-04-22', update: 'Aboutページを追加、免責事項・リンク情報を整理' },
  { id: 'h2', date: '2026-04-21', update: 'ルールページを公開、テキスト置き換え例を掲載' },
  { id: 'h3', date: '2026-04-20', update: '使用制限ページを追加、禁止/制限カード一覧を更新' },
  { id: 'h4', date: '2026-04-18', update: '詳細検索フォームの属性フィルタを改善' },
  { id: 'h5', date: '2026-04-15', update: 'カードリストの表示速度を改善' },
  { id: 'h6', date: '2026-04-10', update: 'エクスパンション一覧のブロック表示を追加' },
  { id: 'h7', date: '2026-04-01', update: 'サイト公開' }
]

const linkItems: LinkItem[] = [
  {
    id: 'l1',
    title: 'モンスター・コレクションTCG公式サイト',
    description: '最新ルール・大会情報・製品情報の一次情報を確認できます。',
    href: '#'
  },
  {
    id: 'l2',
    title: '公式FAQ・裁定集',
    description: '裁定の細かな差異やテキスト置き換え確認に利用します。',
    href: '#'
  },
  {
    id: 'l3',
    title: 'プレイヤーコミュニティWiki',
    description: 'カード運用例や対戦レポートなど、実践的な情報がまとまっています。',
    href: '#'
  },
  {
    id: 'l4',
    title: '公認大会情報ページ',
    description: '直近の店舗大会・大型大会スケジュール確認にご利用ください。',
    href: '#'
  }
]

const historyRows = computed<HistoryRow[]>(() =>
  historySourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)
</script>

<template>
  <section class="d-flex flex-column ga-4">
    <v-card variant="outlined">
      <v-sheet color="primary" class="px-4 py-2 text-subtitle-2 font-weight-bold text-white">
        免責事項
      </v-sheet>
      <v-card-text>
        <p v-for="item in disclaimerItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-sheet color="accent" class="px-4 py-2 text-subtitle-2 font-weight-bold text-white">
        このサイトについて
      </v-sheet>
      <v-card-text>
        <p v-for="item in aboutItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-sheet color="accent" class="px-4 py-2 text-subtitle-2 font-weight-bold text-white">
        謝辞
      </v-sheet>
      <v-card-text>
        <p v-for="item in thanksItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-sheet color="primary" class="px-4 py-2 text-subtitle-2 font-weight-bold text-white">
        更新履歴
      </v-sheet>
      <v-data-table
        :headers="historyHeaders"
        :items="historyRows"
        item-value="id"
        fixed-header
        height="360"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        class="about-table"
      >
        <template #item="{ item }">
          <tr class="about-table__row" :class="{ 'about-table__row--zebra': item.zebra }">
            <td class="px-3 py-2">{{ item.date }}</td>
            <td class="px-3 py-2">{{ item.update }}</td>
          </tr>
        </template>
      </v-data-table>
    </v-card>

    <v-card variant="outlined">
      <v-sheet color="accent" class="px-4 py-2 text-subtitle-2 font-weight-bold text-white">
        リンク
      </v-sheet>
      <v-card-text class="d-flex flex-column ga-2">
        <v-card
          v-for="item in linkItems"
          :key="item.id"
          :href="item.href"
          variant="outlined"
          class="pa-3"
        >
          <p class="text-subtitle-2 font-weight-bold text-accent mb-1">
            {{ item.title }}
          </p>
          <p class="text-caption">
            {{ item.description }}
          </p>
        </v-card>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <v-sheet color="accent" class="px-4 py-2 text-subtitle-2 font-weight-bold text-white">
        お問い合わせ
      </v-sheet>
      <v-card-text>
        <p class="text-body-2 mb-2">
          誤記の報告・機能要望・掲載内容のご相談は、以下の連絡先からお願いします。
        </p>
        <p class="text-body-2 mb-2">
          <a href="#" class="text-accent font-weight-bold">X（旧Twitter）DM: @monsearch_support</a>
        </p>
        <p class="text-body-2">
          <a href="https://example.com/monsearch-contact" class="text-accent">連絡フォーム: https://example.com/monsearch-contact</a>
        </p>
      </v-card-text>
    </v-card>
  </section>
</template>

<style scoped>
.about-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-secondary));
  color: #3e2723;
  font-weight: 700;
}

.about-table :deep(tbody tr td) {
  border-bottom: 1px solid #eef3e4;
}

.about-table__row--zebra td {
  background: #f8fbf1;
}

.about-table__row:hover td {
  background: #eef7e3;
}
</style>
