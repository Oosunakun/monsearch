<script setup lang="ts">
interface CategoryBreakdown {
  label: string
  count: number
  color: string
}

defineProps<{
  items: CategoryBreakdown[]
}>()
</script>
<template>
  <div
    class="d-none d-md-block mb-3 pa-2 rounded border-thin"
    style="background-color: rgba(229, 223, 216, 0.15); border-color: rgba(229, 223, 216, 0.80);"
  >
    <div class="d-flex flex-wrap ga-1">
      <v-chip
        v-for="item in items"
        :key="item.label"
        size="small"
        variant="outlined"
        class="rounded-md border-thin bg-white text-grey-darken-3"
        style="font-size: 11px; height: 24px; padding: 0 8px;"
      >
        <span class="accent-dot" :class="`bg-${item.color}`" />
        {{ item.label }}: <span class="font-weight-bold ml-1 mr-1 text-black">{{ item.count }}</span>件
      </v-chip>
    </div>
  </div>
</template>
<style scoped>
.accent-dot {
  display: block;
  width: 7px;
  height: 7px;
  margin-top: 0.5px;
  margin-right: 4px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>