<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import ContentMaxWidthContainer from '~~/app/components/atoms/common/ContentMaxWidthContainer.vue'
import CardSearchResultList from '~/components/organisms/cards/_CardSearchResultList.vue'
import SectionCardShell from '~~/app/components/molecules/common/SectionCardShell.vue'
import AppSectionHeader from '~~/app/components/atoms/common/AppSectionHeader.vue'

const router = useRouter()

// 検索画面（条件編集）へ戻る動線
const editSearchCondition = () => {
  router.push('/cards/search')
}
</script>

<template>
  <ContentMaxWidthContainer>
    <SectionCardShell>
      <template #header>
        <AppSectionHeader title="詳細検索" color="primary" text-class="text-white" />
      </template>

      <v-container fluid class="pa-4 pt-6 card-result-page">
        <v-sheet
          border
          class="condition-summary-sticky pa-3 mb-4 bg-surface rounded d-flex align-center justify-space-between flex-wrap gap-2"
        >
          <div class="d-flex align-center flex-wrap gap-2">
            <span class="text-caption font-weight-bold text-medium-emphasis">現在の検索条件:</span>
            <v-chip size="small" variant="flat" color="red-lighten-4" class="text-red-darken-4 rounded-sm font-weight-bold">🔴 火</v-chip>
            <v-chip size="small" variant="flat" color="green-lighten-4" class="text-green-darken-4 rounded-sm font-weight-bold">⭐ ドラゴン</v-chip>
          </div>

          <v-btn
            color="primary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-filter-variant-edit"
            class="font-weight-bold rounded-sm"
            @click="editSearchCondition"
          >
            検索条件を編集
          </v-btn>
        </v-sheet>

        <CardSearchResultList />

      </v-container>
    </SectionCardShell>
  </ContentMaxWidthContainer>
</template>

<style scoped>
/* .card-result-page {
  min-height: calc(100vh - 56px);
} */

/* 上部に固定して、スクロールしても条件を見失わないようにする */
.condition-summary-sticky {
  position: sticky;
  top: 56px; /* ヘッダーの高さに合わせて調整 */
  z-index: 90;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.gap-2 { gap: 8px; }
</style>