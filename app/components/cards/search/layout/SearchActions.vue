<script setup lang="ts">
import SectionCardShell from '~~/app/components/common/layout/SectionCardShell.vue'

defineProps<{
  onExecute: () => void
}>()
</script>

<template>
<SectionCardShell class="sticky-bottom-actions">
    <div class="d-flex justify-center">
      <v-btn
        color="primary"
        variant="flat"
        size="large"
        class="font-weight-bold px-12"
        @click="onExecute"
      >
        この条件で検索
      </v-btn>
    </div>
</SectionCardShell>
</template>
<style>
.sticky-bottom-actions {
  position: sticky;
  bottom: 0;
  z-index: 100;
}
</style>