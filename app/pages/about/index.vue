<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import SectionCardShell from '~~/app/components/molecules/common/SectionCardShell.vue'
import ExternalLinkCard from '~~/app/components/molecules/common/ExternalLinkCard.vue'
import HistoryTable from '~~/app/components/organisms/about/HistoryTable.vue'
import type { HistoryRow } from '~~/app/components/organisms/about/HistoryTable.vue'

import {
  mockAboutDisclaimerItems,
  mockAboutHistoryHeaders,
  mockAboutHistorySourceRows,
  mockAboutItems,
  mockAboutLinkItems,
  mockAboutThanksItems,
  mockAboutContactItems
} from '~~/app/utils/mockData'

type TextItem = {
  id: string
  text: string
}

type LinkItem = {
  id: string
  title: string
  subtitle: string
  icon: string
  href: string
}

const disclaimerItems: TextItem[] = mockAboutDisclaimerItems
const aboutItems: TextItem[] = mockAboutItems
const thanksItems: TextItem[] = mockAboutThanksItems
const historyHeaders = mockAboutHistoryHeaders
const historySourceRows = mockAboutHistorySourceRows
const linkItems: LinkItem[] = mockAboutLinkItems
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
        <AppSectionHeader title="免責事項" color="primary" text-class="text-white" />
      </template>
      <ul>
        <li v-for="item in disclaimerItems" :key="item.id">
          {{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="このサイトについて" color="primary" text-class="text-white" />
      </template>
      <ul>
        <li v-for="item in aboutItems" :key="item.id">
          {{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="謝辞" color="primary" text-class="text-white" />
      </template>
      <ul>
        <li v-for="item in thanksItems" :key="item.id">
          {{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="更新履歴" color="primary" text-class="text-white" />
      </template>

      <HistoryTable
        :headers="historyHeaders"
        :rows="historyRows"
      />
    </SectionCardShell>

    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="リンク" color="primary" text-class="text-white" />
      </template>
      <v-row
        :no-gutters="false"
        density="comfortable"
        style="row-gap: 10px;"
      >
        <v-col
          v-for="item in linkItems"
          :key="item.id"
          cols="12"
          md="6"
        >
          <ExternalLinkCard
            :title="item.title"
            :subtitle="item.subtitle"
            :href="item.href"
          />
        </v-col>
      </v-row>
    </SectionCardShell>

    <SectionCardShell :margin-bottom="false">
      <template #header>
        <AppSectionHeader title="お問い合わせ" color="primary" text-class="text-white" />
      </template>
      <p>
        誤記の報告・機能要望・掲載内容のご相談は、以下の連絡先からお願いします。
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
            :icon="item.icon"
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

</style>