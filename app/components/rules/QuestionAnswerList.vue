<script setup lang="ts">
import type { QuestionAnswerItem } from '~~/app/types/ui/rules'
import QuestionAnswerExpansionItem from '~~/app/components/rules/QuestionAnswerExpansionItem.vue'
import EmptyState from '~~/app/components/common/app/EmptyState.vue'
import SkeletonLoader from '~~/app/components/common/app/SkeletonLoader.vue'

const props = defineProps<{
  items: QuestionAnswerItem[]
}>()

// フィルター状態
const cardNameFilter = ref('')

// フィルター適用
const filteredItems = computed(() => {
  return props.items.filter(item => {
    const cardMatch = !cardNameFilter.value
      || item.cards?.some(c =>
          c.name.includes(cardNameFilter.value)
        )
      || item.category?.includes(cardNameFilter.value)
      || item.question.includes(cardNameFilter.value)
      || item.answer.includes(cardNameFilter.value)
    return cardMatch
  })
})

const resetFilter = () => {
  cardNameFilter.value = ''
}

const { isMounted } = useHydrated()
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
   <!-- フィルターバー -->
   <v-sheet class="pa-3 mb-3" rounded border>
    <v-row dense align="center">
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
      <v-col cols="12" sm="2">
        <v-btn
          variant="tonal"
          color="grey"
          density="compact"
          block
          @click="resetFilter"
        >
          リセット
        </v-btn>
      </v-col>
    </v-row>
    <!-- 件数表示 -->
    <div class="text-caption text-medium-emphasis mt-2">
      {{ filteredItems.length }}件 / 全{{ items.length }}件
    </div>
  </v-sheet>

  <!-- 結果なし -->
  <EmptyState v-if="filteredItems.length === 0" title="該当するQ&Aがありません" />

  <!-- アコーディオン一覧 -->
  <v-expansion-panels variant="accordion" flat>
    <QuestionAnswerExpansionItem
      v-for="item in filteredItems"
      :key="item.id"
      :item="item"
      :value="item.id"
    />
  </v-expansion-panels>
  </template>
</template>