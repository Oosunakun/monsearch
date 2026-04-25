<script setup lang="ts">
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import {
  mockAvailableExpansions,
  mockBannedRestrictionSourceRows,
  mockRestrictionHeaders,
  mockLimitedRestrictionSourceRows,
  mockRestrictionNoticeItems,
  mockRestrictionPolicyNotes
} from '~~/app/utils/mockData'

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

const noticeItems: NoticeItem[] = mockRestrictionNoticeItems
const policyNotes: NoticeItem[] = mockRestrictionPolicyNotes
const availableExpansions: ExpansionItem[] = mockAvailableExpansions

const headers = mockRestrictionHeaders

const bannedSourceRows: RestrictionSource[] = mockBannedRestrictionSourceRows
const limitedSourceRows: RestrictionSource[] = mockLimitedRestrictionSourceRows

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
      <StickyTableHeaderRow theme="secondary" text-color="#3e2723">
        <v-data-table
          :headers="headers"
          :items="bannedRows"
          item-value="id"
          fixed-header
          height="340"
          density="comfortable"
          hide-default-footer
          items-per-page="-1"
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
      </StickyTableHeaderRow>
    </v-card>

    <v-card variant="outlined">
      <AppSectionHeader title="制限カード" color="primary" text-class="text-white" />
      <StickyTableHeaderRow theme="secondary" text-color="#3e2723">
        <v-data-table
          :headers="headers"
          :items="limitedRows"
          item-value="id"
          fixed-header
          height="420"
          density="comfortable"
          hide-default-footer
          items-per-page="-1"
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
      </StickyTableHeaderRow>
    </v-card>
  </section>
</template>
