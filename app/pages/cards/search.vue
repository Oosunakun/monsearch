<script setup lang="ts">
import { useAnalytics } from '~~/app/composables/useAnalytics'
import { useRoute, useRouter } from 'vue-router'
import ContentMaxWidthContainer from '~~/app/components/common/layout/ContentMaxWidthContainer.vue'
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'
import SectionHeader from '~~/app/components/common/layout/SectionHeader.vue'
import SearchActions from '~~/app/components/cards/search/layout/SearchActions.vue'
import SearchFormBasic from '~~/app/components/cards/search/layout/SearchFormBasic.vue'
import SearchFormOrigin from '~~/app/components/cards/search/layout/SearchFormOrigin.vue'
import SearchFormUnit from '~~/app/components/cards/search/layout/SearchFormUnit.vue'
import SearchFormEquipment from '~~/app/components/cards/search/layout/SearchFormEquipment.vue'
import SearchFormLand from '~~/app/components/cards/search/layout/SearchFormLand.vue'
import SearchFormEffect from '~~/app/components/cards/search/layout/SearchFormEffect.vue'
import SearchFormOther from '~~/app/components/cards/search/layout/SearchFormOther.vue'
import { useCardSearchForm } from '~~/app/composables/useCardSearchForm'
import { buildCardSearchQuery } from '~~/app/utils/search/cardSearchQueryBuilder'
import { parseCardSearchQuery } from '~~/app/utils/search/cardSearchQueryParser'

const route = useRoute()
const router = useRouter()
const analytics = useAnalytics()
const { form } = useCardSearchForm(parseCardSearchQuery(route.query))

if (import.meta.client && useNuxtApp().isHydrating) {
  const initialFormKey = JSON.stringify(form.value)
  const initialPath = route.path
  let edited = false
  let disposed = false
  let settled = false
  // 同値の初期通知は無視し、実際に編集されたフォームは遅延復元で上書きしない。
  const stopEditingWatch = watch(form, () => {
    if (JSON.stringify(form.value) !== initialFormKey) edited = true
  }, { deep: true, flush: 'sync' })
  const stopRouteWatch = watch(() => route.path, (path) => {
    if (path !== initialPath) disposed = true
  }, { flush: 'sync' })
  const stopWatching = () => { stopEditingWatch(); stopRouteWatch() }
  onScopeDispose(() => { disposed = true; stopWatching() })
  onNuxtReady(() => {
    if (settled) return
    settled = true
    stopWatching()
    if (!disposed && !edited && route.path === initialPath) {
      form.value = parseCardSearchQuery(route.query)
    }
  })
}

// 明示的な検索実行
const executeSearch = async () => {
  const query = buildCardSearchQuery(form.value)
  const token = analytics.submit('advanced', query)
  try {
    await router.push(Object.keys(query).length ? { path: '/cards', query } : { path: '/cards' })
  } finally { analytics.finishSubmit(token) }
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
        <SectionHeader title="基本情報" color="accent" text-class="text-white" />
      </template>
      
      <SearchFormBasic v-model="form" />
    </SectionCardShell>
    
    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="カードセット・所属" color="accent" text-class="text-white" />
      </template>

      <SearchFormOrigin v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      v-show="shownUnitSectionCardShell"
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="ユニット" color="accent" text-class="text-white" />
      </template>
      
      <SearchFormUnit v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      v-show="shownItemEquipSectionCardShell"
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="装備品" color="accent" text-class="text-white" />
      </template>
      
      <SearchFormEquipment v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      v-show="shownLandSectionCardShell"
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="地形" color="accent" text-class="text-white" />
      </template>
      
      <SearchFormLand v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="特殊能力・カード効果" color="accent" text-class="text-white" />
      </template>
      
      <SearchFormEffect v-model="form" />
    </SectionCardShell>

    <SectionCardShell
      :collapsible="true"
      :initially-open="true"
    >
      <template #header>
        <SectionHeader title="その他" color="accent" text-class="text-white" />
      </template>
      
      <SearchFormOther v-model="form" />
    </SectionCardShell>

    <SearchActions :on-execute="executeSearch" />
  </ContentMaxWidthContainer>
</template>
