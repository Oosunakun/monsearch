<script setup lang="ts">
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'

defineProps<{
  onExecute: () => void
  onClear: () => void
}>()
</script>

<template>
  <SectionCardShell class="sticky-bottom-actions" content-class="search-actions-content">
    <div class="search-actions d-flex flex-nowrap justify-center align-center">
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        class="font-weight-bold px-12"
        @click="onExecute"
      >
        この条件で検索
      </v-btn>
      <v-btn
        type="button"
        variant="outlined"
        size="large"
        class="search-actions-clear search-actions-clear-theme font-weight-medium"
        aria-label="すべての条件をクリア"
        @click="onClear"
      >
        <span class="d-none d-md-inline">すべての条件をクリア</span>
        <span class="d-md-none">クリア</span>
      </v-btn>
    </div>
  </SectionCardShell>
</template>
<style scoped>
.sticky-bottom-actions {
  position: sticky;
  bottom: 0;
  z-index: 100;
}

.search-actions {
  gap: 8px;
}

.search-actions-clear-theme {
  background-color: #f2f7fb;
  color: #386b8a;
  border: 1px solid #b6cddc;
}

/* Vuetify の md 未満では検索ボタンの余白を保ったまま横一列に収める。 */
@media (width < 840px) {
  .sticky-bottom-actions :deep(.search-actions-content) {
    padding-inline: 2px;
  }

  .search-actions {
    gap: 6px;
  }

  .search-actions-clear {
    min-width: 64px;
    padding-inline: 8px;
    font-size: 0.875rem;
  }
}
</style>
