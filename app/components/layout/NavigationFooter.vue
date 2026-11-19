<script setup lang="ts">
import { formatBuildInfo } from '~~/app/utils/buildInfo/formatBuildInfo'

defineProps<{
  rail: boolean
}>()
const info = useRuntimeConfig().public.buildInfo
const lines = computed(() => info.commitSha ? formatBuildInfo(info) : null)
</script>
<template>
  <div v-if="!rail && lines" class="build-info px-4 py-3 text-caption">
    <div class="build-info-release text-medium-emphasis">{{ lines.release }}</div>
    <div class="build-info-build text-disabled">{{ lines.build }}</div>
  </div>
</template>
<style scoped>
.build-info { 
  line-height: 1.5; 
}
.build-info-release { 
  font-size: 11px;
  font-weight: 400;
}
.build-info-build { 
  font-size: 10px;
  font-weight: 400;
}
.build-info-release,
.build-info-build {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
