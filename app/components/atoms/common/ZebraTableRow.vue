<script setup lang="ts">
withDefaults(
  defineProps<{
    zebra?: boolean
    clickable?: boolean
  }>(),
  {
    zebra: false,
    clickable: false
  }
)
</script>

<template>
  <tr class="zebra-table-row" :class="{ 'zebra-table-row--zebra': zebra, 'zebra-table-row--clickable': clickable }">
    <slot></slot>
  </tr>
</template>

<style scoped>
.zebra-table-row :slotted(td) {
  border-bottom: 1px solid #eef3e4;
}

.zebra-table-row--zebra :slotted(td) {
  background: #f8fbf1;
}

.zebra-table-row:hover :slotted(td) {
  background: #eef7e3;
}

.zebra-table-row--clickable {
  cursor: pointer;
}
</style>
