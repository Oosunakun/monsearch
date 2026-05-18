<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import SectionCardShell from '~~/app/components/molecules/common/SectionCardShell.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'
import CardSearchActions from '~~/app/components/organisms/cards/CardSearchActions.vue'

import CardSearchFieldName from '~~/app/components/organisms/cards/search/CardSearchFieldName.vue'
import CardSearchFieldElement from '~~/app/components/organisms/cards/search/CardSearchFieldElement.vue'
import type { SearchForm } from '~~/app/types/ui/search'

import CardSearchFormBasic from '~~/app/components/organisms/cards/CardSearchFormBasic.vue'
import CardSearchFormOrigin from '~~/app/components/organisms/cards/CardSearchFormOrigin.vue'
import CardSearchFormUnit from '~~/app/components/organisms/cards/CardSearchFormUnit.vue'
import CardSearchFormEquipment from '~~/app/components/organisms/cards/CardSearchFormEquipment.vue'
import CardSearchFormLand from '~~/app/components/organisms/cards/CardSearchFormLand.vue'
import CardSearchFormEffect from '~~/app/components/organisms/cards/CardSearchFormEffect.vue'
import CardSearchFormOther from '~~/app/components/organisms/cards/CardSearchFormOther.vue'

import { SEARCH_OPERATOR } from '~~/app/utils/constants/search/conditions'
import type { NumericCondition, FilteredNumericCondition, SlotCondition } from '~~/app/types/ui/search'

import { useCardSearchForm } from '~~/app/composables/useCardSearchForm'


const router = useRouter()

const { form, resetForm } = useCardSearchForm()

// 明示的な検索実行
const executeSearch = () => {
  router.push('/cards')
}

// 簡易検索（テキスト＋エンター or ボタンクリックで即実行）
const quickSearch = () => {
  if (!form.value?.keyword) return
  // 他の条件を上書きせず独立して実行するロジックへ
  router.push('/cards')
}

const shownUnitSectionCardShell = computed(() => {
  if(!form.value.cardCategory) {
    return true
  }
  return ["unit", "token"].includes(form.value.cardCategory)
})
const shownItemEquipSectionCardShell = computed(() => {
  if(!form.value.cardCategory) {
    return true
  }
  return ["item-equip", "token"].includes(form.value.cardCategory)
})
const shownLandSectionCardShell = computed(() => {
  if(!form.value.cardCategory) {
    return true
  }
  return ["land", "token"].includes(form.value.cardCategory)
})
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="基本情報" color="accent" text-class="text-white" />
      </template>
      
      <CardSearchFormBasic v-model="form" />
    </SectionCardShell>
    
    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="カードセット・所属" color="accent" text-class="text-white" />
      </template>

      <CardSearchFormOrigin v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
      v-show="shownUnitSectionCardShell"
    >
      <template #header>
        <AppSectionHeader title="ユニット" color="accent" text-class="text-white" />
      </template>
      
      <CardSearchFormUnit v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
      v-show="shownItemEquipSectionCardShell"
    >
      <template #header>
        <AppSectionHeader title="装備品" color="accent" text-class="text-white" />
      </template>
      
      <CardSearchFormEquipment v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
      v-show="shownLandSectionCardShell"
    >
      <template #header>
        <AppSectionHeader title="地形" color="accent" text-class="text-white" />
      </template>
      
      <CardSearchFormLand v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="特殊能力・カード効果" color="accent" text-class="text-white" />
      </template>
      
      <CardSearchFormEffect v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <AppSectionHeader title="その他" color="accent" text-class="text-white" />
      </template>
      
      <CardSearchFormOther v-model="form" />
    </SectionCardShell>

    <CardSearchActions :on-execute="executeSearch" />
  </ContentMaxWidthContainer>
</template>