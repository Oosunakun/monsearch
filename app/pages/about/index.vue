<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import ExternalLinkCard from '~~/app/components/common/links/ExternalLinkCard.vue'
import HistoryTable from '~~/app/components/about/HistoryTable.vue'
import type { HistoryRow } from '~~/app/components/about/HistoryTable.vue'
import { parseInlineLinks } from '~~/app/utils/parseInlineLinks'

import {
  mockAboutHistoryHeaders,
  mockAboutHistorySourceRows,
  mockAboutItems,
  mockAboutAnalyticsItems,
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
const analyticsItems = mockAboutAnalyticsItems.map(item => ({
  id: item.id,
  subheading: item.subheading,
  parts: parseInlineLinks(item.text)
}))
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

    <SectionCardShell>
      <template #header>
        <SectionHeader title="アクセス解析とプライバシー" color="primary" text-class="text-white" />
      </template>
      <ul class="about-notice-list">
        <li v-for="item in analyticsItems" :key="item.id">
          <span class="font-weight-bold">{{ item.subheading }}：</span>
          <template v-for="(part, index) in item.parts" :key="index">
            <a v-if="part.type === 'link'" :href="part.href">
              {{ part.text }}
            </a>
            <template v-else>
              {{ part.text }}
            </template>
          </template>
        </li>
      </ul>
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
