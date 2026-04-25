<script setup lang="ts">
import type { NavItem } from '~~/app/types/ui/layout'

defineProps<{
  items: NavItem[]
  activePath: string
}>()
</script>

<template>
  <v-sheet class="header-nav-wrap d-none d-lg-block" border="b">
    <v-container class="py-2" style="max-width: 1360px;">
      <div class="d-flex flex-wrap ga-2">
        <v-btn
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :color="activePath === item.to ? 'primary' : undefined"
          :variant="activePath === item.to ? 'flat' : 'outlined'"
          class="text-body-2 nav-btn"
          size="small"
        >
          {{ item.label }}
        </v-btn>
      </div>
    </v-container>
  </v-sheet>
</template>

<style scoped>
.header-nav-wrap {
  background: #f7f7f7;
}

.nav-btn {
  text-transform: none;
}
</style>
