<script setup lang="ts">
import { UI_COLORS } from '~~/app/utils/constants/colors'

defineProps<{
  count: number
  prefix?: string
}>()
</script>

<template>
  <p class="text-subtitle-1 font-weight-bold mb-2" :style="{ color: UI_COLORS.headingBrown }">
    <template v-if="prefix === ''">{{ count }}件</template>
    <template v-else>{{ prefix ?? '検索結果' }} {{ count }}件</template>
  </p>
</template>
