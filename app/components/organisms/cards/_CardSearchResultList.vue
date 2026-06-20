<script setup lang="ts">
import { ref } from 'vue'

// Props: 親（index.vue）から検索結果セットを受け取る
// ※現段階ではUI配置が目的なので型はanyとしています
defineProps<{
  results?: any[]
}>()

// 分類タブ
const activeTab = ref('all')
const counts = { all: 142, unit: 85, spell: 32, item: 15 }
</script>

<template>
  <div class="card-search-result-list">
    <v-tabs
      v-model="activeTab"
      color="primary"
      density="compact"
      class="mb-4"
    >
      <v-tab value="all">すべて ({{ counts.all }})</v-tab>
      <v-tab value="unit">ユニット ({{ counts.unit }})</v-tab>
      <v-tab value="spell">スペル ({{ counts.spell }})</v-tab>
      <v-tab value="item">アイテム ({{ counts.item }})</v-tab>
    </v-tabs>

    <div class="result-list-container">
      <v-expansion-panels variant="accordion" multiple>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center w-100">
              <span class="font-weight-bold flex-grow-1">カード名（例: 火竜ゲオルグ）</span>
              <span class="text-caption text-medium-emphasis mr-4">Lv3 / 攻5 / 防4</span>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="card-detail-content">
              ここにカード効果、種族、収録リストなどを動的に描画
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <div class="d-flex justify-space-between align-center mt-6">
      <v-btn variant="text" size="small" prepend-icon="mdi-sort">並び替え</v-btn>
      <v-pagination :length="6" density="compact" total-visible="5" />
    </div>
  </div>
</template>

<style scoped>
/* リストコンテナのスタイル 
   検索結果が0件の場合のメッセージ表示エリアなどをここに配置
*/
.card-search-result-list {
  min-height: 500px;
}
</style>