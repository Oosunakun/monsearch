<script setup lang="ts">
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import {
  mockAboutDisclaimerItems,
  mockAboutHistoryHeaders,
  mockAboutHistorySourceRows,
  mockAboutItems,
  mockAboutLinkItems,
  mockAboutThanksItems
} from '~~/app/utils/mockData'

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

const disclaimerItems: TextItem[] = mockAboutDisclaimerItems
const aboutItems: TextItem[] = mockAboutItems
const thanksItems: TextItem[] = mockAboutThanksItems
const historyHeaders = mockAboutHistoryHeaders
const historySourceRows = mockAboutHistorySourceRows
const linkItems: LinkItem[] = mockAboutLinkItems

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
      <AppSectionHeader title="免責事項" color="primary" text-class="text-white" />
      <v-card-text>
        <p v-for="item in disclaimerItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="このサイトについて" color="accent" text-class="text-white" />
      <v-card-text>
        <p v-for="item in aboutItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="謝辞" color="accent" text-class="text-white" />
      <v-card-text>
        <p v-for="item in thanksItems" :key="item.id" class="text-body-2 mb-2">
          {{ item.text }}
        </p>
      </v-card-text>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="更新履歴" color="primary" text-class="text-white" />
      <StickyTableHeaderRow theme="secondary" text-color="#3e2723">
        <v-data-table
          :headers="historyHeaders"
          :items="historyRows"
          item-value="id"
          fixed-header
          height="360"
          density="comfortable"
          hide-default-footer
          items-per-page="-1"
        >
          <template #item="{ item }">
            <ZebraTableRow :zebra="item.zebra">
              <td class="px-3 py-2">{{ item.date }}</td>
              <td class="px-3 py-2">{{ item.update }}</td>
            </ZebraTableRow>
          </template>
        </v-data-table>
      </StickyTableHeaderRow>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="リンク" color="accent" text-class="text-white" />
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
      <AppSectionHeader title="お問い合わせ" color="accent" text-class="text-white" />
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

