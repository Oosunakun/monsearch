<script setup lang="ts">
import { UI_COLORS } from '~~/app/utils/constants/colors'

withDefaults(
  defineProps<{
    title?: string
    text?: string
    icon?: string
  }>(),
  {
    title: 'データの取得に失敗しました',
    text: '通信環境をご確認のうえ、再試行してください。',
    icon: 'mdi-alert-circle-outline'
  }
)
</script>

<template>
  <v-sheet class="pa-4">
    <v-empty-state
      :icon="icon"
      :title="title"
      :text="text"
      class="app-error-state"
    >
      <template #actions>
        <slot name="actions"></slot>
      </template>
    </v-empty-state>
  </v-sheet>
</template>

<style scoped>
.app-error-state {
  border: 1px solid color-mix(in srgb, v-bind('UI_COLORS.SECONDARY') 35%, white);
  border-radius: 12px;
  background-color: color-mix(in srgb, v-bind('UI_COLORS.SECONDARY') 8%, white);
}
</style>
