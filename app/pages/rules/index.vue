<script setup lang="ts">
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import QuestionAnswerList from '~~/app/components//rules/QuestionAnswerList.vue'
import RuleSupplementList from '~~/app/components//rules/RuleSupplementList.vue'
import CardRulingList from '~~/app/components//rules/CardRulingList.vue'

import type { 
  QuestionAnswerItem, 
  RuleSupplementItem, 
  TextChangeRuling, 
  ErrataRuling, 
  CardRulingItem,
  TextIndividualRuling
} from '~~/app/types/ui/rules'

import {
  mockRuleNoticeItems,
  mockRuleQuestionAnswerSources,
  mockRuleSupplementSources,
  mockRuleTextChangeSources,
  mockRuleErrataSources,
  mockRuleTextIndividualSources
} from '~~/app/utils/mockData'
type NoticeItem = {
  id: string
  text: string
}

const noticeItems: NoticeItem[] = mockRuleNoticeItems

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
        <SectionHeader title="注意事項" color="primary" text-class="text-white" />
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
        <SectionHeader title="カード裁定" color="accent" text-class="text-white" />
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
        <SectionHeader title="Q&A" color="accent" text-class="text-white" />
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
        <SectionHeader title="補足" color="accent" text-class="text-white" />
      </template>

      <RuleSupplementList
        :items="supplementItems"
      />
    </SectionCardShell>

  </ContentMaxWidthContainer>
</template>

