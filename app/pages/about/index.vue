<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import ExternalLinkCard from '~~/app/components/common/links/ExternalLinkCard.vue'
import HistoryTable from '~~/app/components/about/HistoryTable.vue'
import type { HistoryRow } from '~~/app/components/about/HistoryTable.vue'

import {
  mockAboutHistoryHeaders,
  mockAboutHistorySourceRows,
  mockAboutItems,
  mockAboutThanksItems,
  mockAboutContactItems
} from '~~/app/utils/mockData'
import type {
   FinderReleaseNote
} from '~~/app/utils/mockData'

type AboutItem = {
  id: string
  subheading: string
  text: string
}

type LinkItem = {
  id: string
  title: string
  subtitle: string
  iconSrc: string
  iconSize?: number
  href: string
}

const aboutItems: AboutItem[] = mockAboutItems
const thanksItems: AboutItem[] = mockAboutThanksItems
const historyHeaders = mockAboutHistoryHeaders
const historySourceRows: FinderReleaseNote[] = mockAboutHistorySourceRows
const contactItems: LinkItem[] = mockAboutContactItems

const historyRows = computed<HistoryRow[]>(() =>
  historySourceRows.map((row, index) => ({
    ...row,
    zebra: index % 2 === 1
  }))
)
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <SectionHeader title="当サイトについて" color="primary" text-class="text-white" />
      </template>
      <ul class="about-notice-list">
        <li v-for="item in aboutItems" :key="item.id">
          <span class="font-weight-bold">{{ item.subheading }}：</span>{{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <SectionHeader title="アクセス解析について" color="primary" text-class="text-white" />
      </template>
      <p>
        当サイトの正式公開環境では、検索機能の使いやすさの改善と開発の優先順位の検討のため、Google Analytics 4を利用します。
        閲覧ページ、検索条件を含むURL、簡易・詳細検索の操作、検索結果件数、端末・ブラウザー等の利用情報をGoogleへ送信します。
        広告・リマーケティングを目的とした利用は行いません。
      </p>
      <p>
        Cookie（_ga、_ga_から始まるCookie）を使用します。Cookieの有効期間は通常、最終利用から最長2年です。
        イベント・ユーザーデータの保持期間は2か月とし、Cookieの期間とは異なります。
        Google Analyticsの標準データ除去機能を利用する方針ですが、個人情報の送信を完全に防ぐものではありません。
        検索欄にメールアドレス・電話番号・氏名・住所等の個人情報を入力しないでください。
      </p>
      <p>
        情報の取扱いは
        <a href="https://policies.google.com/privacy">Googleのプライバシーポリシー</a>と
        <a href="https://policies.google.com/technologies/partner-sites">Googleによる情報の利用方法</a>をご確認ください。
        計測を停止する方法は
        <a href="https://support.google.com/analytics/answer/181881?hl=ja">Google公式のオプトアウト案内</a>をご参照ください。
        オプトアウト用の拡張機能は対応ブラウザーでのみ利用でき、モバイル等では利用できない場合があります。
        ご質問は本ページの「お問い合わせ」からご連絡ください。
      </p>
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <SectionHeader title="謝辞" color="primary" text-class="text-white" />
      </template>
      <ul class="about-notice-list">
        <li v-for="item in thanksItems" :key="item.id">
          <span class="font-weight-bold">{{ item.subheading }}：</span>{{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <SectionHeader title="更新履歴" color="primary" text-class="text-white" />
      </template>

      <HistoryTable
        :headers="historyHeaders"
        :rows="historyRows"
      />
    </SectionCardShell>

    <SectionCardShell :margin-bottom="false">
      <template #header>
        <SectionHeader title="お問い合わせ" color="primary" text-class="text-white" />
      </template>
      <p>
        誤記の報告、機能要望、掲載内容に関するご相談は、下記よりお寄せください。
      </p>
      <v-row
        :no-gutters="false"
        style="row-gap: 10px;"
        density="comfortable"
        class="contact-links"
      >
        <v-col
          v-for="item in contactItems"
          :key="item.id"
          cols="12"
          md="6" 
        >
          <ExternalLinkCard
            :title="item.title"
            :subtitle="item.subtitle"
            :href="item.href"
            :icon-src="item.iconSrc"
            :icon-size="item.iconSize"
          />
        </v-col>
      </v-row>
    </SectionCardShell>
  </ContentMaxWidthContainer>

</template>
<style scoped>
.contact-links {
  margin-top: 12px;
}

/* タイムラインのドット位置を微調整 */
:deep(.v-timeline-item__dot) {
  margin-top: 4px;
}

.about-notice-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.about-notice-list li {
  margin-bottom: 0.5rem; 
  font-size: 0.875rem;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.87);
}

.about-notice-list li:last-child {
  margin-bottom: 0;
}
</style>
