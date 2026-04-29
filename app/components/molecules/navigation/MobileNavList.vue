<script setup lang="ts">
import type { NavItem } from '~~/app/types/ui/layout'

defineProps<{
  modelValue: boolean
  items: NavItem[]
  activePath: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  navigate: [path: string]
}>()

const closeDrawer = () => emit('update:modelValue', false)

const navigateTo = (path: string) => {
  emit('navigate', path)
  closeDrawer()
}
</script>

<template>
  <v-navigation-drawer
    :model-value="modelValue"
    temporary
    location="left"
    width="280"
    @update:model-value="emit('update:modelValue', Boolean($event))"
  >
    <v-list nav>
      <v-list-item
        v-for="item in items"
        :key="item.to"
        :title="item.label"
        :active="activePath === item.to"
        @click="navigateTo(item.to)"
      />
    </v-list>
  </v-navigation-drawer>
</template>
