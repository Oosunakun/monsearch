<script setup lang="ts">
defineProps<{
  modelValue: boolean
  searchForm: any
}>()
const emit = defineEmits(['update:modelValue', 'update:searchForm'])
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    location="right"
    temporary
    width="320"
    class="card-filter-drawer"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="pa-4 h-100 d-flex flex-column">
      <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center justify-space-between">
        <span>詳細フィルタ</span>
        <v-btn icon="mdi-close" variant="text" density="compact" @click="emit('update:modelValue', false)" />
      </div>
      
      <div class="flex-grow-1 overflow-y-auto">
        <v-expansion-panels variant="accordion">
          <v-expansion-panel title="⚔️ 戦闘ステータス" readonly />
          <v-expansion-panel title="🔮 能力・スロット" readonly />
          <v-expansion-panel title="📝 効果検索" readonly />
          <v-expansion-panel title="📦 収録情報" readonly />
        </v-expansion-panels>
      </div>

      <div class="pt-4 border-top">
        <v-btn color="primary" block @click="emit('update:modelValue', false)">
          この条件で検索 (142件)
        </v-btn>
      </div>
    </div>
  </v-navigation-drawer>
</template>