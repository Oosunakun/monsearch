<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { computed, ref, watch } from 'vue'
import type { CardRulingItem, RulingType } from '~~/app/types/ui/rules'
import CardRulingExpansionItem from '~~/app/components/rules/CardRulingExpansionItem.vue'
import EmptyState from '~~/app/components/common/app/EmptyState.vue'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'

import {
  getRulingSearchText,
  getRulingTypeColor,
  getRulingTypeLabel,
} from '~~/app/utils/ruling'

const props = defineProps<{
  items: CardRulingItem[]
}>()

const { mobile } = useDisplay()
const { isMounted } = useHydrated()

const cardNameFilter = ref('')
const typeFilter = ref<RulingType | 'all'>('all')
const openedPanelId = ref<string | number | null>(null)

const filterText = computed(() =>
  (cardNameFilter.value ?? '').trim(),
)

const filteredItems = computed(() => {
  return props.items.filter(item => {
    if (
      typeFilter.value !== 'all'
      && item.type !== typeFilter.value
    ) {
      return false
    }

    if (!filterText.value) {
      return true
    }

    return getRulingSearchText(item)
      .some(text => text.includes(filterText.value))
  })
})

const countGroup = computed(() => {
  return props.items.reduce(
    (acc, item) => {
      acc[item.type]++
      return acc
    },
    {
      text_individual: 0,
      text_change: 0,
      errata: 0,
    },
  )
})

const scrollToCategory = async (type: RulingType) => {
  await nextTick()

  document
    .querySelector(`.ruling-group-${type}`)
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
}

watch(
  [cardNameFilter, typeFilter],
  () => {
    openedPanelId.value = null
  },
)

const resetFilter = () => {
  cardNameFilter.value = ''
  typeFilter.value = 'all'
}

const typeOptions = computed(() => [
  {
    title: 'すべてのカード裁定',
    value: 'all',
  },
  {
    title: 'カード別注意点',
    value: 'text_individual',
  },
  {
    title: '変更概要',
    value: 'text_change',
  },
  {
    title: 'エラッタ',
    value: 'errata',
  },
])

const getScrollBadgeTitle = (
  type: RulingType,
  count: number,
) => {
  return `${getRulingTypeLabel(type, mobile.value)} (${count})`
}
</script>

<template>
  <template v-if="!isMounted">
    <SkeletonLoader 
      height="360"
      preset="table-rows"
      :loading="true"
    />
  </template>
  <template v-else>
    <v-sheet class="pa-3 mb-3" rounded border>
      <v-row density="comfortable" align="center">
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="cardNameFilter"
            label="カード名・キーワード"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            prepend-inner-icon="mdi-magnify"
          />
        </v-col>
        
        <v-col cols="12" sm="5">
          <v-select
            v-model="typeFilter"
            :items="typeOptions"
            label="カード裁定種別"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>

        <v-col cols="12" sm="2">
          <v-btn
            variant="tonal"
            color="grey"
            density="compact"
            block
            style="height: 40px;"
            @click="resetFilter"
          >
            リセット
          </v-btn>
        </v-col>
      </v-row>
      
      <div class="text-caption text-medium-emphasis mt-2">
        {{ filteredItems.length }}件 / 全{{ items.length }}件
      </div>
    </v-sheet>

    <div
      v-if="!cardNameFilter && typeFilter === 'all' && filteredItems.length > 0"
      class="mb-3 d-flex justify-start ga-1 w-100"
    >
      <v-btn
        v-if="countGroup.text_individual > 0"
        size="small"
        variant="tonal"
        :color="getRulingTypeColor('text_individual')"
        class="anchor-btn font-weight-bold flex-grow-1"
        prepend-icon="mdi-arrow-down"
        @click="scrollToCategory('text_individual')"
      >
        {{ getScrollBadgeTitle('text_individual', countGroup.text_individual) }}
      </v-btn>

      <v-btn
        v-if="countGroup.text_change > 0"
        size="small"
        variant="tonal"
        :color="getRulingTypeColor('text_change')"
        class="anchor-btn font-weight-bold flex-grow-1"
        prepend-icon="mdi-arrow-down"
        @click="scrollToCategory('text_change')"
      >
        {{ getScrollBadgeTitle('text_change', countGroup.text_change) }}
      </v-btn>

      <v-btn
        v-if="countGroup.errata > 0"
        size="small"
        variant="tonal"
        :color="getRulingTypeColor('errata')"
        class="anchor-btn font-weight-bold flex-grow-1"
        prepend-icon="mdi-arrow-down"
        @click="scrollToCategory('errata')"
      >
        {{ getScrollBadgeTitle('errata', countGroup.errata) }}
      </v-btn>
    </div>

    <EmptyState v-if="filteredItems.length === 0" title="該当するカード裁定がありません" />

    <v-expansion-panels v-else v-model="openedPanelId" variant="accordion" flat class="border rounded-md overflow-hidden">
      <CardRulingExpansionItem
        v-for="(item, index) in filteredItems"
        :key="`${item.type}:${item.id}`"
        :item="item"
        :opened-panel-id="openedPanelId"
        :class="{
          'ruling-group-text_individual': item.type === 'text_individual' && (index === 0 || filteredItems[index - 1]?.type !== 'text_individual'),
          'ruling-group-text_change': item.type === 'text_change' && (index === 0 || filteredItems[index - 1]?.type !== 'text_change'),
          'ruling-group-errata': item.type === 'errata' && (index === 0 || filteredItems[index - 1]?.type !== 'errata'),
          'scroll-margin-top': true
        }"
      />
    </v-expansion-panels>
  </template>
</template>
<style scoped>
/* =========================================
 * scroll
 * ======================================= */

 .scroll-margin-top {
  scroll-margin-top: 48px;
}

/* =========================================
 * anchor button
 * ======================================= */

.anchor-btn {
  max-width: 200px;
  padding-inline: 9px;
  font-size: 0.75rem;
}

.anchor-btn :deep(.v-btn__prepend) {
  margin-inline-end: 4px;
}
</style>