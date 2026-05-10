<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import SectionCardShell from '~~/app/components/molecules/common/SectionCardShell.vue'
import StickyTableHeaderRow from '~~/app/components/atoms/common/StickyTableHeaderRow.vue'
import ZebraTableRow from '~~/app/components/atoms/common/ZebraTableRow.vue'
import QuestionAnswerList from '~~/app/components//organisms/rules/QuestionAnswerList.vue'
import RuleSupplementList from '~~/app/components//organisms/rules/RuleSupplementList.vue'
import CardRulingList from '~~/app/components//organisms/rules/CardRulingList.vue'

import { UI_COLORS } from '~~/app/utils/constants/colors'
import type { 
  QuestionAnswerItem, 
  RuleSupplementItem, 
  TextChangeRuling, 
  ErrataRuling, 
  CardRulingItem,
  TextIndividualRuling
} from '~~/app/types/ui/rules'

import {
  mockRuleConstructionNotes,
  mockRuleReplacementHeaders,
  mockRuleNoticeItems,
  mockRuleReplacementSources,
  mockRuleQuestionAnswerSources,
  mockRuleSupplementSources,
  mockRuleTextChangeSources,
  mockRuleErrataSources,
  mockRuleTextIndividualSources
} from '~~/app/utils/mockData'
import { useDisplay } from 'vuetify'
const { mobile } = useDisplay()
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


const qaItems:QuestionAnswerItem[] = mockRuleQuestionAnswerSources
const supplementItems:RuleSupplementItem[] = mockRuleSupplementSources

const textIndividualRulingItems:TextIndividualRuling[] = mockRuleTextIndividualSources
const textChangeRulingItems:TextChangeRuling[] = mockRuleTextChangeSources
const errataRulingItems:ErrataRuling[] = mockRuleErrataSources
const cardRulingItems:CardRulingItem[] =[
  ... textIndividualRulingItems,
  ... textChangeRulingItems,
  ... errataRulingItems
]

</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="注意事項" color="primary" text-class="text-white" />
      </template>
      <ul>
        <li v-for="item in noticeItems" :key="item.id">
          {{ item.text }}
        </li>
      </ul>
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="カード裁定" color="accent" text-class="text-white" />
      </template>

      <CardRulingList
        :items="cardRulingItems"
      />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="Q&A" color="accent" text-class="text-white" />
      </template>

      <QuestionAnswerList
        :items="qaItems"
      />
    </SectionCardShell>


    
    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="補足" color="accent" text-class="text-white" />
      </template>

      <RuleSupplementList
        :items="supplementItems"
      />
    </SectionCardShell>

  </ContentMaxWidthContainer>
</template>

