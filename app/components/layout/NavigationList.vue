<script setup lang="ts">
import type { NavItem } from '~~/app/types/ui/layout'

defineProps<{
  items: NavItem[]
}>()

</script>

<template>
  <v-list nav density="compact" :prepend-gap="20">
    <v-list-item
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      :prepend-icon="item.icon"
      :title="item.label"
      color="primary"
    />
  </v-list>
</template>
