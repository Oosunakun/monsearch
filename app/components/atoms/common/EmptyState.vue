<script setup lang="ts">
withDefaults(
  defineProps<{
    icon?: string
    title?: string
    text?: string
  }>(),
  {
    icon: 'mdi-database-search-outline',
    title: '該当するカードがありません',
    text: '検索条件を変更して再度お試しください。'
  }
)
</script>

<template>
  <v-empty-state
    :icon="icon"
    :title="title"
    :text="text"
  >
    <template #actions>
      <slot name="actions" />
    </template>
  </v-empty-state>
</template>
