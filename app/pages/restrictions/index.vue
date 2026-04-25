<script setup lang="ts">
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'

type NoticeItem = {
  id: string
  text: string
}

type ExpansionItem = {
  id: string
  label: string
}

type RestrictionRow = {
  id: string
  setCode: string
  cardName: string
  category: string
  restrictionType: string
  period: string
  zebra: boolean
}

type RestrictionSource = Omit<RestrictionRow, 'zebra'>

const noticeItems: NoticeItem[] = [
  { id: 'priority', text: '適用優先順位: 禁止 ＞ 期間禁止 ＞ 期間制限 ＝ 封印制限' },
  { id: 'updated', text: '最終更新日: 2026-04-22' }
]

const policyNotes: NoticeItem[] = [
  { id: 'deck', text: 'デックは50枚構築、同名カードは3枚まで。オープン環境で使用可能な全プールから選択できます。' },
  { id: 'title', text: 'タイトルカードは記載された勢力・属性条件を満たす場合のみ採用可能です。' },
  { id: 'term', text: '適用期間: 2026年4月1日〜次回改訂告知前日まで' }
]

const availableExpansions: ExpansionItem[] = [
  { id: '6d', label: '6D: 悠久のハルシオン' },
  { id: '6c', label: '6C: アゾールの黒い旋風' },
  { id: '6b', label: '6B: 紅河の戦慄' },
  { id: '5d', label: '5D: 魔海神の魔壺' },
  { id: '5c', label: '5C: 剣姫' },
  { id: '4d', label: '4D: 天空の覇者' },
  { id: '4c', label: '4C: 神霊獣の咆哮' }
]

const headers = [
  { title: 'セットコード', key: 'setCode', sortable: false },
  { title: 'カード名', key: 'cardName', sortable: false },
  { title: 'カテゴリ', key: 'category', sortable: false },
  { title: '種別', key: 'restrictionType', sortable: false },
  { title: '適用期間', key: 'period', sortable: false }
]

const bannedSourceRows: RestrictionSource[] = [
  { id: 'b1', setCode: '6D', cardName: '禁書庫のアークデーモン', category: 'ユニット', restrictionType: '禁止', period: '2026-04-01〜' },
  { id: 'b2', setCode: '6C', cardName: '終焉のブラックホール', category: '戦闘スペル', restrictionType: '期間禁止', period: '2026-04-01〜2026-07-31' },
  { id: 'b3', setCode: '6B', cardName: '次元断のミラージュ', category: '地形', restrictionType: '禁止', period: '2026-04-01〜' },
  { id: 'b4', setCode: '5D', cardName: '冥界門のパンドラ', category: '儀式スペル', restrictionType: '期間禁止', period: '2026-04-01〜2026-12-31' },
  { id: 'b5', setCode: '5C', cardName: '零域のタイダルウェーブ', category: '戦闘スペル', restrictionType: '禁止', period: '2026-04-01〜' },
  { id: 'b6', setCode: '4D', cardName: '影縫いのグラビティ', category: '装備品', restrictionType: '期間禁止', period: '2026-04-01〜2026-10-31' }
]

const limitedSourceRows: RestrictionSource[] = [
  { id: 'l1', setCode: '6D', cardName: '双極のタイタン', category: 'ユニット', restrictionType: '期間制限', period: '2026-04-01〜2026-09-30' },
  { id: 'l2', setCode: '6D', cardName: '暴威のフェンリル', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l3', setCode: '6C', cardName: '魔弾のスナイパー', category: '戦闘スペル', restrictionType: '期間制限', period: '2026-04-01〜2026-08-31' },
  { id: 'l4', setCode: '6B', cardName: '霧都のアサシン', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l5', setCode: '6B', cardName: '崩落のゲート', category: '地形', restrictionType: '期間制限', period: '2026-04-01〜2026-10-31' },
  { id: 'l6', setCode: '5D', cardName: '聖域のグリフォン', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l7', setCode: '5C', cardName: '幽冥のヴェール', category: '儀式スペル', restrictionType: '期間制限', period: '2026-04-01〜2026-12-31' },
  { id: 'l8', setCode: '5C', cardName: '時逆のクロノス', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' },
  { id: 'l9', setCode: '4D', cardName: '雷刃のハルバード', category: '装備品', restrictionType: '期間制限', period: '2026-04-01〜2026-11-30' },
  { id: 'l10', setCode: '4C', cardName: '深森のアルラウネ', category: 'ユニット', restrictionType: '封印制限', period: '2026-04-01〜' }
]

const bannedRows = computed<RestrictionRow[]>(() =>
  bannedSourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)

const limitedRows = computed<RestrictionRow[]>(() =>
  limitedSourceRows.map((row, index) => ({
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
          <a href="#" class="text-accent">公式情報はモンスター・コレクションTCG公式サイトの告知をご確認ください。</a>
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="構築条件＜オープン：フルオープンオプション＞" color="accent" text-class="text-white" />
      <v-card-text>
        <p v-for="item in policyNotes" :key="item.id" class="text-body-2 mb-2" :class="{ 'font-weight-bold': item.id === 'title' }">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="使用できるエクスパンション" color="accent" text-class="text-white" />
      <v-card-text>
        <ul class="pl-5">
          <li v-for="item in availableExpansions" :key="item.id" class="text-body-2 text-accent mb-1">
            <a href="#" class="text-accent">{{ item.label }}</a>
          </li>
        </ul>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="禁止カード" color="primary" text-class="text-white" />
      <v-data-table
        :headers="headers"
        :items="bannedRows"
        item-value="id"
        fixed-header
        height="340"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        class="restriction-table"
      >
        <template #item="{ item }">
          <ZebraTableRow :zebra="item.zebra">
            <td class="px-3 py-2">{{ item.setCode }}</td>
            <td class="px-3 py-2"><span class="text-accent">{{ item.cardName }}</span></td>
            <td class="px-3 py-2">{{ item.category }}</td>
            <td class="px-3 py-2">{{ item.restrictionType }}</td>
            <td class="px-3 py-2">{{ item.period }}</td>
          </ZebraTableRow>
        </template>
      </v-data-table>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="制限カード" color="primary" text-class="text-white" />
      <v-data-table
        :headers="headers"
        :items="limitedRows"
        item-value="id"
        fixed-header
        height="420"
        density="comfortable"
        hide-default-footer
        items-per-page="-1"
        class="restriction-table"
      >
        <template #item="{ item }">
          <ZebraTableRow :zebra="item.zebra">
            <td class="px-3 py-2">{{ item.setCode }}</td>
            <td class="px-3 py-2"><span class="text-accent">{{ item.cardName }}</span></td>
            <td class="px-3 py-2">{{ item.category }}</td>
            <td class="px-3 py-2">{{ item.restrictionType }}</td>
            <td class="px-3 py-2">{{ item.period }}</td>
          </ZebraTableRow>
        </template>
      </v-data-table>
    </v-card>
  </section>
</template>

<style scoped>
.restriction-table :deep(thead th) {
  position: sticky;
  top: 0;
  z-index: 2;
  background: rgb(var(--v-theme-secondary));
  color: #3e2723;
  font-weight: 700;
}

</style>
